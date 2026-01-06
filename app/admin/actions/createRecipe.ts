"use server";

import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/adminAuth";

interface RecipeIngredient {
  ingredient_id?: number;
  name_en?: string;
  name_bn?: string;
  quantity: string;
  unit_en: string;
  unit_bn: string;
  notes_en?: string;
  notes_bn?: string;
  image?: string; // Image URL from Gemini
}

interface RecipeStep {
  step_number: number;
  instruction_en: string;
  instruction_bn: string;
  timestamp?: string;
}

interface BlogContent {
  intro_en: string;
  intro_bn: string;
  what_makes_it_special_en: string;
  what_makes_it_special_bn: string;
  cooking_tips_en: string;
  cooking_tips_bn: string;
  serving_en: string;
  serving_bn: string;
  storage_en?: string;
  storage_bn?: string;
  full_blog_en: string;
  full_blog_bn: string;
}

interface RecipeData {
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  youtube_url: string;
  youtube_id?: string;
  cuisine: string;
  category: string;
  foodCategory?: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  blogContent?: BlogContent;
  newIngredients?: Array<{
    name_en: string;
    name_bn: string;
    img?: string;
  }>;
}

export async function createRecipeWithIngredients(recipeData: RecipeData, token: string) {
  if (!verifyToken(token)) {
    return {
      success: false,
      error: "Unauthorized: Invalid or expired token",
    };
  }

  try {
    // Check if recipe with this YouTube ID already exists
    if (recipeData.youtube_id) {
      const existingRecipe = await prisma.recipe.findFirst({
        where: { youtube_id: recipeData.youtube_id },
      });
      
      if (existingRecipe) {
        return {
          success: false,
          error: `This YouTube video has already been imported as "${existingRecipe.title_en}". You cannot add the same video twice.`,
        };
      }
    }

    // First, create any new ingredients if provided
    const newIngredientMap = new Map<string, number>();
    
    if (recipeData.newIngredients && recipeData.newIngredients.length > 0) {
      for (const newIng of recipeData.newIngredients) {
        // Check if ingredient already exists
        const existing = await prisma.ingredient.findFirst({
          where: {
            OR: [
              { name_en: { equals: newIng.name_en, mode: "insensitive" } },
              { name_bn: { equals: newIng.name_bn } },
            ],
          },
        });

        if (existing) {
          newIngredientMap.set(newIng.name_en.toLowerCase(), existing.id);
        } else {
          const created = await prisma.ingredient.create({
            data: {
              name_en: newIng.name_en,
              name_bn: newIng.name_bn,
              img: newIng.img || "",
              phonetic: [],
            },
          });
          newIngredientMap.set(newIng.name_en.toLowerCase(), created.id);
        }
      }
    }

    // Resolve all ingredients
    const resolvedIngredients: Array<{
      ingredientId: number;
      meta: RecipeIngredient;
    }> = [];
    const createdIngredients: string[] = [];

    for (const ing of recipeData.ingredients) {
      let ingredientId: number | null = null;

      // Priority 1: If ingredient_id is provided, verify it exists
      if (ing.ingredient_id) {
        const found = await prisma.ingredient.findUnique({
          where: { id: ing.ingredient_id },
        });
        if (found) {
          ingredientId = found.id;
        }
      }

      // Priority 2: Search by name_en or name_bn (case-insensitive)
      if (!ingredientId && (ing.name_en || ing.name_bn || ing.notes_en || ing.notes_bn)) {
        const searchName = ing.name_en || ing.notes_en || ing.name_bn || ing.notes_bn || "";
        
        // Try to find existing ingredient with comprehensive search
        const found = await prisma.ingredient.findFirst({
          where: {
            OR: [
              ing.name_en
                ? { name_en: { equals: ing.name_en, mode: "insensitive" } }
                : undefined,
              ing.name_bn
                ? { name_bn: { equals: ing.name_bn } }
                : undefined,
              ing.notes_en
                ? { name_en: { equals: ing.notes_en, mode: "insensitive" } }
                : undefined,
              ing.notes_bn
                ? { name_bn: { equals: ing.notes_bn } }
                : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (found) {
          ingredientId = found.id;
        } else {
          // Check in newly created ingredients map
          const nameKey = (ing.name_en || ing.notes_en || "").toLowerCase();
          if (newIngredientMap.has(nameKey)) {
            ingredientId = newIngredientMap.get(nameKey)!;
          } else {
            // Double-check one more time before creating
            const doubleCheck = await prisma.ingredient.findFirst({
              where: {
                OR: [
                  { name_en: { contains: ing.name_en || ing.notes_en || "", mode: "insensitive" } },
                  { name_bn: { contains: ing.name_bn || ing.notes_bn || "" } },
                ],
              },
            });

            if (doubleCheck) {
              ingredientId = doubleCheck.id;
              newIngredientMap.set(nameKey, doubleCheck.id);
            } else {
              // Create new ingredient with data from Gemini
              const created = await prisma.ingredient.create({
                data: {
                  name_en: ing.name_en || ing.notes_en || "Unknown",
                  name_bn: ing.name_bn || ing.notes_bn || "Unknown",
                  img: ing.image || "", // Use image from Gemini
                  phonetic: [],
                },
              });
              ingredientId = created.id;
              createdIngredients.push(
                `${created.name_en} (ID: ${created.id}${ing.image ? ", with image" : ""})`
              );
              newIngredientMap.set(nameKey, created.id);
            }
          }
        }
      }

      if (ingredientId) {
        resolvedIngredients.push({ ingredientId, meta: ing });
      } else {
        // Last resort: create with whatever we have
        const created = await prisma.ingredient.create({
          data: {
            name_en: ing.name_en || ing.notes_en || "Unknown",
            name_bn: ing.name_bn || ing.notes_bn || "Unknown",
            img: ing.image || "",
            phonetic: [],
          },
        });
        ingredientId = created.id;
        createdIngredients.push(
          `${created.name_en} (ID: ${created.id}${ing.image ? ", with image" : ""})`
        );
        resolvedIngredients.push({ ingredientId, meta: ing });
      }
    }

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        slug: recipeData.slug,
        title_en: recipeData.title_en,
        title_bn: recipeData.title_bn,
        image: recipeData.image,
        youtube_url: recipeData.youtube_url,
        youtube_id: recipeData.youtube_id || "",
        cuisine: recipeData.cuisine,
        category: recipeData.category,
        foodCategory: recipeData.foodCategory || "Savory",
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        ingredients: {
          create: resolvedIngredients.map((r) => ({
            ingredient: {
              connect: { id: r.ingredientId },
            },
            quantity: r.meta.quantity,
            unit_en: r.meta.unit_en,
            unit_bn: r.meta.unit_bn || "",
            notes_en: r.meta.notes_en || null,
            notes_bn: r.meta.notes_bn || null,
          })),
        },
        steps: {
          create: recipeData.steps.map((s) => ({
            step_number: s.step_number,
            instruction_en: s.instruction_en,
            instruction_bn: s.instruction_bn,
            timestamp: s.timestamp || null,
          })),
        },
        blogContent: recipeData.blogContent
          ? {
              create: {
                intro_en: recipeData.blogContent.intro_en,
                intro_bn: recipeData.blogContent.intro_bn,
                what_makes_it_special_en:
                  recipeData.blogContent.what_makes_it_special_en,
                what_makes_it_special_bn:
                  recipeData.blogContent.what_makes_it_special_bn,
                cooking_tips_en: recipeData.blogContent.cooking_tips_en,
                cooking_tips_bn: recipeData.blogContent.cooking_tips_bn,
                serving_en: recipeData.blogContent.serving_en,
                serving_bn: recipeData.blogContent.serving_bn,
                storage_en: recipeData.blogContent.storage_en || null,
                storage_bn: recipeData.blogContent.storage_bn || null,
                full_blog_en: recipeData.blogContent.full_blog_en,
                full_blog_bn: recipeData.blogContent.full_blog_bn,
              },
            }
          : undefined,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        steps: true,
        blogContent: true,
      },
    });

    return {
      success: true,
      recipe,
      message: `Recipe "${recipe.title_en}" created successfully!${
        createdIngredients.length > 0
          ? `\n\nNew ingredients created: ${createdIngredients.join(", ")}`
          : ""
      }`,
    };
  } catch (error: any) {
    console.error("Error creating recipe:", error);
    return {
      success: false,
      error: error.message || "Failed to create recipe",
    };
  }
}
