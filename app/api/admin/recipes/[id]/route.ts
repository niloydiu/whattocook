import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

// GET /api/admin/recipes/[id] - Get a single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        steps: {
          orderBy: { step_number: "asc" },
        },
        blogContent: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/recipes/[id] - Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const data = await request.json();
    const recipeId = parseInt(id);

    // Delete existing ingredients and steps
    await prisma.recipeIngredient.deleteMany({
      where: { recipe_id: recipeId },
    });
    await prisma.recipeStep.deleteMany({
      where: { recipe_id: recipeId },
    });

    // Update recipe with new data
    const recipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        slug: data.slug,
        title_en: data.title_en,
        title_bn: data.title_bn,
        image: data.image,
        youtube_url: data.youtube_url,
        youtube_id: data.youtube_id,
        cuisine: data.cuisine,
        category: data.category,
        foodCategory: data.foodCategory,
        difficulty: data.difficulty,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        servings: data.servings,
        ingredients: {
          create: data.ingredients.map((ing: any) => ({
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit_en: ing.unit_en,
            unit_bn: ing.unit_bn,
            notes_en: ing.notes_en,
            notes_bn: ing.notes_bn,
          })),
        },
        steps: {
          create: data.steps.map((step: any) => ({
            step_number: step.step_number,
            instruction_en: step.instruction_en,
            instruction_bn: step.instruction_bn,
            timestamp: step.timestamp,
          })),
        },
        blogContent: data.blogContent
          ? {
              upsert: {
                create: {
                  intro_en: data.blogContent.intro_en,
                  intro_bn: data.blogContent.intro_bn,
                  what_makes_it_special_en:
                    data.blogContent.what_makes_it_special_en,
                  what_makes_it_special_bn:
                    data.blogContent.what_makes_it_special_bn,
                  cooking_tips_en: data.blogContent.cooking_tips_en,
                  cooking_tips_bn: data.blogContent.cooking_tips_bn,
                  serving_en: data.blogContent.serving_en,
                  serving_bn: data.blogContent.serving_bn,
                  storage_en: data.blogContent.storage_en,
                  storage_bn: data.blogContent.storage_bn,
                  full_blog_en: data.blogContent.full_blog_en,
                  full_blog_bn: data.blogContent.full_blog_bn,
                },
                update: {
                  intro_en: data.blogContent.intro_en,
                  intro_bn: data.blogContent.intro_bn,
                  what_makes_it_special_en:
                    data.blogContent.what_makes_it_special_en,
                  what_makes_it_special_bn:
                    data.blogContent.what_makes_it_special_bn,
                  cooking_tips_en: data.blogContent.cooking_tips_en,
                  cooking_tips_bn: data.blogContent.cooking_tips_bn,
                  serving_en: data.blogContent.serving_en,
                  serving_bn: data.blogContent.serving_bn,
                  storage_en: data.blogContent.storage_en,
                  storage_bn: data.blogContent.storage_bn,
                  full_blog_en: data.blogContent.full_blog_en,
                  full_blog_bn: data.blogContent.full_blog_bn,
                },
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
        steps: {
          orderBy: { step_number: "asc" },
        },
        blogContent: true,
      },
    });

    return NextResponse.json(recipe);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/recipes/[id] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    await prisma.recipe.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
