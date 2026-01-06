"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

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
    const text = response
      .text()
      .replace(/```json|```/g, "")
      .trim();

    console.log("[Import] Gemini response received");
    console.log("[Import] Parsing JSON...");
    
    const recipeData = JSON.parse(text);
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
          create: await Promise.all(recipeData.ingredients.map(async (ing: any) => {
            // Try to find existing ingredient
            let ingredient = await prisma.ingredient.findFirst({
              where: {
                OR: [
                  { name_en: { equals: ing.name_en, mode: "insensitive" } },
                  { name_bn: { equals: ing.name_bn } }
                ]
              }
            });

            // If not found, create it
            if (!ingredient) {
              ingredient = await prisma.ingredient.create({
                data: {
                  name_en: ing.name_en,
                  name_bn: ing.name_bn,
                  img: "",
                  phonetic: []
                }
              });
            }

            return {
              ingredient_id: ingredient.id,
              quantity: ing.quantity,
              unit_en: ing.unit_en,
              unit_bn: ing.unit_bn,
              notes_en: ing.notes_en,
              notes_bn: ing.notes_bn
            };
          }))
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
