import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- Logic from search-by-ingredients (Simplified for Chat Tools) ---
function normalizeStr(s?: string): string {
  if (!s) return "";
  const banglaDigits = "০১২৩৪৫৬৭৮৯";
  const latinDigits = "0123456789";
  let out = s
    .toLowerCase()
    .trim()
    .replace(/[.,()\[\]"']/g, "")
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ");
  out = out
    .split("")
    .map((c) => {
      const idx = banglaDigits.indexOf(c);
      return idx >= 0 ? latinDigits[idx] : c;
    })
    .join("");
  return out;
}

function itemMatches(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

// --- Tools/Functions for Gemini ---

async function findRecipesByIngredients(ingredients: string[]) {
  const userIngredients = ingredients.map(normalizeStr).filter(Boolean);
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  const scoredRecipes = recipes
    .map((recipe) => {
      const recipeIngredients = recipe.ingredients.map((ri) => ({
        name_en: normalizeStr(ri.ingredient.name_en),
        name_bn: normalizeStr(ri.ingredient.name_bn),
      }));

      let matchedCount = 0;
      for (const userIng of userIngredients) {
        if (recipeIngredients.some(ri => itemMatches(ri.name_en, userIng) || itemMatches(ri.name_bn, userIng))) {
          matchedCount++;
        }
      }

      return {
        title_en: recipe.title_en,
        title_bn: recipe.title_bn,
        slug: recipe.slug,
        matchCount: matchedCount,
        totalIngredients: recipeIngredients.length,
        matchPercent: matchedCount / recipeIngredients.length,
      };
    })
    .filter((r) => r.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 5);

  return scoredRecipes;
}

async function getRecipeDetails(slug: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: { include: { ingredient: true } },
      steps: { orderBy: { step_number: "asc" } },
      blogContent: true,
    },
  });

  if (!recipe) return { error: "Recipe not found" };

  return {
    title_en: recipe.title_en,
    title_bn: recipe.title_bn,
    cuisine: recipe.cuisine,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    ingredients: recipe.ingredients.map(ri => `${ri.quantity} ${ri.unit_en} ${ri.ingredient.name_en}`),
    steps: recipe.steps.map(s => ({
      step: s.step_number,
      instruction: s.instruction_en,
      timestamp: s.timestamp
    })),
    youtube_url: recipe.youtube_url
  };
}

async function searchRecipes(filters: { cuisine?: string, category?: string, foodCategory?: string, difficulty?: string, maxTime?: number }) {
  const where: any = {};
  if (filters.cuisine) where.cuisine = { contains: filters.cuisine, mode: 'insensitive' };
  if (filters.category) where.category = { contains: filters.category, mode: 'insensitive' };
  if (filters.foodCategory) where.foodCategory = { contains: filters.foodCategory, mode: 'insensitive' };
  if (filters.difficulty) where.difficulty = filters.difficulty;

  let recipes = await prisma.recipe.findMany({ where, take: 10 });

  if (filters.maxTime) {
    recipes = recipes.filter(r => (r.prep_time + r.cook_time) <= (filters.maxTime || 999));
  }

  return recipes.map(r => ({ title: r.title_en, slug: r.slug, cuisine: r.cuisine }));
}

async function getAppMetadata() {
  const cuisines = await prisma.recipe.findMany({ select: { cuisine: true }, distinct: ['cuisine'] });
  const categories = await prisma.recipe.findMany({ select: { category: true }, distinct: ['category'] });
  const ingredients = await prisma.ingredient.findMany({ select: { name_en: true }, take: 20 });
  
  return {
    cuisines: cuisines.map(c => c.cuisine),
    categories: categories.map(c => c.category),
    sampleIngredients: ingredients.map(i => i.name_en)
  };
}

async function searchIngredientsByName(name: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: {
      OR: [
        { name_en: { contains: name, mode: 'insensitive' } },
        { name_bn: { contains: name, mode: 'insensitive' } }
      ]
    },
    take: 5
  });
  return ingredients.map(i => ({ name_en: i.name_en, name_bn: i.name_bn }));
}


export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();
    console.log("[Chat API] Incoming messages:", JSON.stringify(messages));
    console.log("[Chat API] Language:", language);

    const model = genAI.getGenerativeModel({
      model: "models/gemini-flash-latest",
      tools: [
        {
          functionDeclarations: [
            {
              name: "findRecipesByIngredients",
              description: "Search for recipes based on a list of ingredients user has.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  ingredients: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "List of ingredients."
                  }
                },
                required: ["ingredients"]
              }
            },
            {
              name: "getRecipeDetails",
              description: "Get details for a specific recipe using its slug.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  slug: { type: SchemaType.STRING }
                },
                required: ["slug"]
              }
            },
            {
              name: "searchRecipes",
              description: "Flexible search for recipes based on cuisine, category, or time.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  cuisine: { type: SchemaType.STRING },
                  category: { type: SchemaType.STRING },
                  foodCategory: { type: SchemaType.STRING },
                  difficulty: { type: SchemaType.STRING },
                  maxTime: { type: SchemaType.NUMBER }
                }
              }
            },
            {
              name: "getAppMetadata",
              description: "Get available cuisines, categories, and some ingredient names to better understand the app's database.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {}
              }
            },
            {
              name: "searchIngredientsByName",
              description: "Search for specific ingredients in our database to see what we have.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING }
                },
                required: ["name"]
              }
            }
          ]
        }
      ]
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const userMessage = messages[messages.length - 1].content;
    const sysPrompt = `You are an expert culinary assistant for 'What to Cook' (whattocook).
    
    PRIMARY GOALS:
    1. Helping users find recipes based on what they have (using findRecipesByIngredients).
    2. Providing detailed instructions for recipes (using getRecipeDetails).
    3. Suggesting substitutions for missing ingredients (Expert Chef mode).
    4. Navigating the app's cuisines/categories (using searchRecipes and getAppMetadata).

    GUIDELINES:
    - User Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}. Respond in this language.
    - Formatting: Use Markdown for bolding, lists, and links.
    - Links: ALWAYS format recipe links as: [Recipe Title](/recipes/slug).
    - Ingredients: If suggesting a recipe, mention matching ingredients vs missing ones.
    - Be professional, warm, and helpful like a personal chef.
    - If you use a tool, explain the results naturally to the user.
    `;

    const result = await chat.sendMessage(sysPrompt + "\n\nUser: " + userMessage);
    const response = await result.response;
    
    // Check for function calls
    const call = response.candidates?.[0]?.content?.parts?.find(p => p.functionCall);
    
    if (call && call.functionCall) {
      const { name, args } = call.functionCall;
      let toolResult;

      if (name === "findRecipesByIngredients") {
        toolResult = await findRecipesByIngredients((args as any).ingredients as string[]);
      } else if (name === "getRecipeDetails") {
        toolResult = await getRecipeDetails((args as any).slug as string);
      } else if (name === "searchRecipes") {
        toolResult = await searchRecipes(args as any);
      } else if (name === "getAppMetadata") {
        toolResult = await getAppMetadata();
      } else if (name === "searchIngredientsByName") {
        toolResult = await searchIngredientsByName((args as any).name as string);
      }

      const result2 = await chat.sendMessage([{
        functionResponse: {
          name,
          response: { result: toolResult }
        }
      }]);
      
      return NextResponse.json({ message: result2.response.text() });
    }

    return NextResponse.json({ message: response.text() });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
