import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Normalize string for matching (remove special chars, lowercase, trim)
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

// Check if two ingredient strings match
function itemMatches(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

// POST /api/recipes/search-by-ingredients
// Body: { ingredients: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient" },
        { status: 400 }
      );
    }

    // Normalize user ingredients
    const userIngredients = ingredients.map(normalizeStr).filter(Boolean);

    // Fetch all recipes with their ingredients
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Calculate match scores for each recipe
    const scoredRecipes = recipes
      .map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((ri) => {
          const ing = ri.ingredient;
          return {
            name_en: normalizeStr(ing.name_en),
            name_bn: normalizeStr(ing.name_bn),
          };
        });

        const totalIngredients = recipeIngredients.length || 1;
        let matchedCount = 0;

        // Count how many user ingredients match this recipe
        for (const userIng of userIngredients) {
          let foundMatch = false;
          for (const recipeIng of recipeIngredients) {
            if (
              itemMatches(recipeIng.name_en, userIng) ||
              itemMatches(recipeIng.name_bn, userIng)
            ) {
              foundMatch = true;
              break;
            }
          }
          if (foundMatch) {
            matchedCount++;
          }
        }

        // Calculate match percentage
        const matchPercent = matchedCount / totalIngredients;
        const missingCount = totalIngredients - matchedCount;

        return {
          recipe: {
            id: recipe.id,
            slug: recipe.slug,
            title_en: recipe.title_en,
            title_bn: recipe.title_bn,
            image: recipe.image,
            cuisine: recipe.cuisine,
            category: recipe.category,
            difficulty: recipe.difficulty,
            prep_time: recipe.prep_time,
            cook_time: recipe.cook_time,
            servings: recipe.servings,
            createdAt: recipe.createdAt,
          },
          matchPercent,
          matchedCount,
          totalIngredients,
          missingCount,
        };
      })
      .filter((r) => r.matchPercent > 0) // Only show recipes with at least 1 match
      .sort((a, b) => {
        // Sort by:
        // 1. Complete matches first (100%)
        if ((a.matchPercent === 1) !== (b.matchPercent === 1))
          return a.matchPercent === 1 ? -1 : 1;
        // 2. Higher match percentage
        if (b.matchPercent !== a.matchPercent)
          return b.matchPercent - a.matchPercent;
        // 3. Fewer missing ingredients
        if (a.missingCount !== b.missingCount)
          return a.missingCount - b.missingCount;
        // 4. Alphabetically by title
        return a.recipe.title_en.localeCompare(b.recipe.title_en);
      });

    return NextResponse.json({
      recipes: scoredRecipes,
      total: scoredRecipes.length,
      searchedIngredients: ingredients,
    });
  } catch (error) {
    console.error("Error searching recipes by ingredients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
