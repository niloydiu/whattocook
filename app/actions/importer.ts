"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

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
    
    const prompt = `
      Act as a professional chef and data engineer. 
      Below is a transcript from a cooking video. Extract the recipe and format it as a valid JSON object.
      
      Instructions for JSON:
      - title: { en: string, bn: string }
      - ingredients: { en: string[], bn: string[] }
      - instructions: { en: string, bn: string }
      - category: string (e.g., "Street Food", "Main Course", "Dessert")
      
      Rules:
      - Simplify ingredients to single words or short phrases (e.g., "Chicken" instead of "500g Chicken").
      - Translate accurately between English and Bangla.
      - Return ONLY the JSON object, no markdown formatting.

      Transcript: ${transcript}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    const recipeJson = JSON.parse(text);

    // 3. Add metadata
    const newRecipe = {
      id: videoId,
      youtubeId: videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      ...recipeJson
    };

    // 4. Save to local file
    const filePath = path.join(process.cwd(), "lib", "recipeData.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const recipes = JSON.parse(fileData);
    
    // Check if already exists
    const exists = recipes.find((r: any) => r.youtubeId === videoId);
    if (exists) {
      return { success: false, message: "Recipe already exists" };
    }

    recipes.push(newRecipe);
    await fs.writeFile(filePath, JSON.stringify(recipes, null, 2));

    return { success: true, recipe: newRecipe };
  } catch (error: any) {
    console.error("Import Error:", error);
    return { success: false, message: error.message };
  }
}
