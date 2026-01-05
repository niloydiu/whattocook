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

    // 1. Fetch Transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptItems.map((t) => t.text).join(" ");

    // 2. Call Gemini to process transcript
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const recipeData = JSON.parse(text);

    // 3. Check if recipe already exists
    const exists = await prisma.recipe.findUnique({
      where: { slug: recipeData.slug }
    });
    
    if (exists) {
      return { success: false, error: "Recipe with this slug already exists" };
    }

    // 4. Resolve ingredients and create recipe
    // We'll use a simplified version of the logic from createRecipe.ts
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

    return { success: true, recipe: createdRecipe };
  } catch (error: any) {
    console.error("Import Error:", error);
    return { success: false, error: error.message };
  }
}
