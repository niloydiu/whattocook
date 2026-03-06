"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import { findOrCreateIngredientSmart } from "@/lib/ingredientMatcher";
import { RecipeImportSchema, autoFixRecipeImport } from "@/lib/validation/schemas";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MAX_RETRIES = 3;

interface ImportResult {
  success: boolean;
  recipe?: any;
  preview?: any;
  ingredientMatches?: Array<{
    input: string;
    matched: string;
    confidence: number;
    matchType: string;
    isNew: boolean;
  }>;
  warnings?: string[];
  error?: string;
  details?: string;
}

/**
 * Extract YouTube video ID from a URL or raw ID string.
 */
function extractYouTubeId(urlOrId: string): string | null {
  const s = urlOrId.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Call Gemini with retry logic.
 */
async function callGeminiWithRetry(transcript: string, attempt: number = 1): Promise<Record<string, unknown>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

  const prompt = `
Act as a professional chef and data engineer.
Below is a transcript from a cooking video. Extract the recipe and return ONLY a valid JSON object with no markdown fences.

REQUIRED JSON SCHEMA:
{
  "slug": "url-friendly-lowercase-hyphenated",
  "title_en": "English Title",
  "title_bn": "বাংলা শিরোনাম",
  "cuisine": "e.g. Bengali, Indian, Italian",
  "category": "e.g. Main Course, Dessert, Snack",
  "foodCategory": "EXACTLY ONE OF: Savory, Sweet, Spicy, Sour, Dessert, Drinks, Appetizer, Soup, Salad",
  "difficulty": "EXACTLY ONE OF: Easy, Medium, Hard",
  "prep_time": <number in minutes>,
  "cook_time": <number in minutes>,
  "servings": <number>,
  "ingredients": [
    {
      "name_en": "English name",
      "name_bn": "বাংলা নাম",
      "quantity": "e.g. 2, 1/2",
      "unit_en": "e.g. cups, tablespoons, pieces",
      "unit_bn": "e.g. কাপ, চামচ, টুকরো",
      "notes_en": "optional notes",
      "notes_bn": "optional notes in bangla"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction_en": "English instruction",
      "instruction_bn": "বাংলা নির্দেশনা",
      "timestamp": "1:20"
    }
  ],
  "blogContent": {
    "intro_en": "...", "intro_bn": "...",
    "what_makes_it_special_en": "...", "what_makes_it_special_bn": "...",
    "cooking_tips_en": "...", "cooking_tips_bn": "...",
    "serving_en": "...", "serving_bn": "...",
    "storage_en": "...", "storage_bn": "...",
    "full_blog_en": "A detailed blog post (min 100 words)",
    "full_blog_bn": "একটি বিস্তারিত ব্লগ পোস্ট (কমপক্ষে ১০০ শব্দ)"
  }
}

RULES:
- Translate accurately between English and Bangla.
- Use simple, common ingredient names (e.g. "salt" not "Indian mineral water").
- Return ONLY the JSON. No prose, no markdown fences.
- All string fields must be non-empty.
- Timestamps should match the video timeline.
${attempt > 1 ? "\n- IMPORTANT: Previous attempt failed validation. Be very careful with the JSON schema. Double-check all required fields are present and types are correct." : ""}

TRANSCRIPT:
${transcript}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // Clean markdown/code fences
  text = text.replace(/```json|```/gi, "").trim();
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$2");

  // Parse JSON
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error("No JSON object found in Gemini response");
    }
  }

  // Auto-fix and validate
  const { fixed, warnings } = autoFixRecipeImport(parsed);

  const validation = RecipeImportSchema.safeParse(fixed);
  if (!validation.success) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[Import] Validation failed on attempt ${attempt}, retrying...`, validation.error.issues);
      return callGeminiWithRetry(transcript, attempt + 1);
    }
    const issues = validation.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Gemini output failed validation after ${MAX_RETRIES} attempts: ${issues}`);
  }

  return { ...validation.data, _warnings: warnings };
}

/**
 * Import recipe from YouTube - supports preview mode.
 * @param videoIdOrUrl - YouTube video ID or URL
 * @param options.preview - If true, return parsed data without saving to DB
 */
export async function importRecipeFromYoutube(
  videoIdOrUrl: string,
  options: { preview?: boolean } = {}
): Promise<ImportResult> {
  try {
    const videoId = extractYouTubeId(videoIdOrUrl);
    if (!videoId) {
      return { success: false, error: "Invalid YouTube video ID or URL" };
    }

    console.log(`[Import] Starting import for video: ${videoId}`);

    // Check if already imported
    const exists = await prisma.recipe.findFirst({
      where: { youtube_id: videoId },
    });
    if (exists) {
      return {
        success: false,
        error: `This video has already been imported as "${exists.title_en}". You cannot import the same video twice.`,
      };
    }

    // Fetch transcript
    console.log("[Import] Fetching transcript...");
    let transcript: string;
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptItems.map((t) => t.text).join(" ");
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to fetch transcript: ${err.message}. Make sure the video has captions enabled.`,
      };
    }

    if (transcript.length < 50) {
      return { success: false, error: "Transcript is too short. The video may not have adequate captions." };
    }

    // Call Gemini with retry
    console.log("[Import] Calling Gemini AI...");
    const geminiResult = await callGeminiWithRetry(transcript);
    const warnings = (geminiResult._warnings as string[]) || [];
    delete geminiResult._warnings;

    const recipeData = geminiResult as any;

    // Override youtube fields with canonical values
    recipeData.youtube_id = videoId;
    recipeData.youtube_url = `https://www.youtube.com/watch?v=${videoId}`;
    recipeData.image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Resolve ingredients through smart matcher
    console.log("[Import] Matching ingredients...");
    const allIngredients = await prisma.ingredient.findMany({
      select: { id: true, name_en: true, name_bn: true, phonetic: true, synonyms: true },
    });

    const ingredientMatches: ImportResult["ingredientMatches"] = [];
    const resolvedIngredients = await Promise.all(
      recipeData.ingredients.map(async (ing: any) => {
        const result = await findOrCreateIngredientSmart({
          name_en: ing.name_en,
          name_bn: ing.name_bn,
          img: "",
          phonetic: [],
        });

        ingredientMatches!.push({
          input: ing.name_en,
          matched: result.ingredient.name_en,
          confidence: result.isNew ? 0 : 1,
          matchType: result.matchType,
          isNew: result.isNew,
        });

        return {
          ingredient_id: result.ingredient.id,
          quantity: ing.quantity || "",
          unit_en: ing.unit_en || "",
          unit_bn: ing.unit_bn || "",
          notes_en: ing.notes_en || null,
          notes_bn: ing.notes_bn || null,
        };
      })
    );

    // Preview mode: return data without saving
    if (options.preview) {
      return {
        success: true,
        preview: recipeData,
        ingredientMatches,
        warnings,
      };
    }

    // Save to database
    console.log("[Import] Creating recipe in database...");
    const createdRecipe = await prisma.recipe.create({
      data: {
        slug: recipeData.slug,
        title_en: recipeData.title_en,
        title_bn: recipeData.title_bn,
        image: recipeData.image,
        youtube_url: recipeData.youtube_url,
        youtube_id: videoId,
        cuisine: recipeData.cuisine,
        category: recipeData.category,
        foodCategory: recipeData.foodCategory || "Savory",
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        ingredients: { create: resolvedIngredients },
        steps: {
          create: recipeData.steps.map((s: any) => ({
            step_number: s.step_number,
            instruction_en: s.instruction_en,
            instruction_bn: s.instruction_bn,
            timestamp: s.timestamp || null,
          })),
        },
        blogContent: recipeData.blogContent
          ? { create: recipeData.blogContent }
          : undefined,
      },
    });

    console.log(`[Import] Recipe created successfully! ID: ${createdRecipe.id}`);

    return {
      success: true,
      recipe: createdRecipe,
      ingredientMatches,
      warnings,
    };
  } catch (error: any) {
    console.error("[Import] Error:", error);
    return {
      success: false,
      error: error.message,
      details: error.stack,
    };
  }
}
