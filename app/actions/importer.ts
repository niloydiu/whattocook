"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import findOrCreateIngredient from "@/lib/findOrCreateIngredient";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function importRecipeFromYoutube(videoId: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    console.log(`[Import] Starting import for video: ${videoId}`);

    // 1. Fetch Transcript
    console.log("[Import] Fetching transcript...");
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptItems.map((t) => t.text).join(" ");
    console.log(`[Import] Transcript fetched: ${transcript.length} characters`);

    // 2. Call Gemini to process transcript
    console.log("[Import] Calling Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 flash for better quota

    // Get existing ingredients to help Gemini match them
    const existingIngredients = await prisma.ingredient.findMany({
      select: { name_en: true, name_bn: true }
    });
    const ingredientsList = JSON.stringify(existingIngredients);

    const prompt = `
      Act as a professional chef and data engineer. 
      Below is a transcript from a cooking video. Extract the recipe and format it as a valid JSON object.
      
      Instructions for JSON:
      - slug: string (URL friendly version of title)
      - title_en: string
      - title_bn: string
      - cuisine: string (e.g., "Indian", "Italian", "Bengali")
      - category: string (e.g., "Main Course", "Dessert", "Snack")
      - foodCategory: string (MUST BE ONE OF: "Dessert", "Spicy", "Sour", "Sweet", "Savory", "Drinks", "Appetizer", "Soup", "Salad")
      - difficulty: string ("Easy", "Medium", "Hard")
      - prep_time: number (minutes)
      - cook_time: number (minutes)
      - servings: number
      - ingredients: Array of { 
          name_en: string, 
          name_bn: string, 
          quantity: string, 
          unit_en: string, 
          unit_bn: string,
          notes_en: string,
          notes_bn: string
        }
      - steps: Array of {
          step_number: number,
          instruction_en: string,
          instruction_bn: string,
          timestamp: string (e.g., "1:20")
        }
      - blogContent: {
          intro_en: string,
          intro_bn: string,
          what_makes_it_special_en: string,
          what_makes_it_special_bn: string,
          cooking_tips_en: string,
          cooking_tips_bn: string,
          serving_en: string,
          serving_bn: string,
          storage_en: string,
          storage_bn: string,
          full_blog_en: string,
          full_blog_bn: string
        }
      
      Rules:
      - Translate accurately between English and Bangla.
      - IMPORTANT: Use the following list of known ingredients if they match. Use the exact "name_en" and "name_bn" values.
      Known Ingredients: ${ingredientsList}
      
      - Return ONLY the JSON object, no markdown formatting.

      Transcript: ${transcript}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Normalize common markdown/code fences and markdown links
    try {
      // Replace markdown links like [label](url) with the URL if the URL looks like https?
      text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$2");
      // Remove ```json or ``` fences
      text = text.replace(/```json|```/gi, "");
      text = text.trim();
    } catch (e) {
      console.warn("[Import] Warning normalizing Gemini text:", e);
    }

    console.log("[Import] Gemini response received: length=", text.length);
    console.log("[Import] Attempting to parse JSON from response...");

    let recipeData: any;
    try {
      recipeData = JSON.parse(text);
    } catch (err) {
      // Attempt to extract the first JSON object substring as a fallback
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const candidate = text.substring(firstBrace, lastBrace + 1);
        try {
          recipeData = JSON.parse(candidate);
        } catch (err2) {
          console.error("[Import] Failed to parse extracted JSON candidate:", err2);
          throw new Error("Failed to parse JSON from Gemini response");
        }
      } else {
        console.error("[Import] No JSON object found in Gemini response");
        throw new Error("No JSON found in Gemini response");
      }
    }

    // Ensure youtube_id and youtube_url are canonical and valid
    const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
    function extractYouTubeId(urlOrId: string | undefined) {
      if (!urlOrId) return null;
      const s = String(urlOrId).trim();
      if (YT_ID_RE.test(s)) return s;
      // try common url patterns
      const patterns = [
        /v=([A-Za-z0-9_-]{11})/, // standard
        /youtu\.be\/([A-Za-z0-9_-]{11})/, // short
        /embed\/([A-Za-z0-9_-]{11})/,
      ];
      for (const p of patterns) {
        const m = s.match(p);
        if (m) return m[1];
      }
      return null;
    }

    let youtubeId = extractYouTubeId(recipeData.youtube_id || recipeData.youtube_url || recipeData.youtube || "");
    if (!youtubeId && recipeData.image) {
      // Try to extract id from image urls like .../vi/ID/...
      const m = String(recipeData.image).match(/vi\/(?:([A-Za-z0-9_-]{11}))/);
      if (m) youtubeId = m[1];
    }

    if (youtubeId) {
      recipeData.youtube_id = youtubeId;
      recipeData.youtube_url = `https://www.youtube.com/watch?v=${youtubeId}`;
      // Always construct canonical thumbnail from the id
      recipeData.image = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      recipeData.thumbnailAlternatives = [
        `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`,
        `https://img.youtube.com/vi/${youtubeId}/0.jpg`,
      ];
      recipeData.validation = recipeData.validation ?? {};
      recipeData.validation.youtube_id_valid = true;
      recipeData.validation.youtube_url_valid = true;
      recipeData.validation.image_url_valid_format = true;
    } else {
      // No valid id found — clear fields and mark validation
      recipeData.youtube_id = "";
      recipeData.youtube_url = "";
      recipeData.validation = recipeData.validation ?? {};
      recipeData.validation.youtube_id_valid = false;
      recipeData.validation.youtube_url_valid = false;
      recipeData.validation.image_url_valid_format = false;
      // keep any newIngredients notes so human can review
    }
    console.log(`[Import] Recipe parsed: ${recipeData.title_en}`);

    // 3. Check if recipe already exists by YouTube video ID
    console.log(`[Import] Checking if video already imported: ${videoId}`);
    const exists = await prisma.recipe.findFirst({
      where: { youtube_id: videoId }
    });
    
    if (exists) {
      console.log("[Import] Recipe already exists!");
      return { 
        success: false, 
        error: `This video has already been imported as "${exists.title_en}". You cannot import the same video twice.` 
      };
    }

    // 4. Resolve ingredients and create recipe
    console.log("[Import] Creating recipe in database...");
    const createdRecipe = await prisma.recipe.create({
      data: {
        slug: recipeData.slug,
        title_en: recipeData.title_en,
        title_bn: recipeData.title_bn,
        image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        youtube_id: videoId,
        cuisine: recipeData.cuisine,
        category: recipeData.category,
        foodCategory: recipeData.foodCategory || "Savory",
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        ingredients: {
          create: await Promise.all(
            recipeData.ingredients.map(async (ing: any) => {
              const ingredient = await findOrCreateIngredient({
                name_en: ing.name_en,
                name_bn: ing.name_bn,
                img: "",
                phonetic: [],
              });

              return {
                ingredient_id: ingredient.id,
                quantity: ing.quantity,
                unit_en: ing.unit_en,
                unit_bn: ing.unit_bn,
                notes_en: ing.notes_en,
                notes_bn: ing.notes_bn,
              };
            })
          ),
        },
        steps: {
          create: recipeData.steps.map((s: any) => ({
            step_number: s.step_number,
            instruction_en: s.instruction_en,
            instruction_bn: s.instruction_bn,
            timestamp: s.timestamp
          }))
        },
        blogContent: {
          create: recipeData.blogContent
        }
      }
    });

    console.log(`[Import] Recipe created successfully! ID: ${createdRecipe.id}`);
    
    return { 
      success: true, 
      recipe: createdRecipe,
      geminiResponse: recipeData // Include the parsed Gemini response
    };
  } catch (error: any) {
    console.error("[Import] Error:", error);
    console.error("[Import] Error stack:", error.stack);
    return { 
      success: false, 
      error: error.message,
      details: error.stack // Include stack trace for debugging
    };
  }
}
