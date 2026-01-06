import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

// GET /api/admin/recipes - Get all recipes with pagination
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.recipe.count(),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();

    const recipe = await prisma.recipe.create({
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/recipes - Bulk delete recipes
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid recipe IDs provided" },
        { status: 400 }
      );
    }

    // Delete many recipes. Cascade delete handles the rest
    await prisma.recipe.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ message: `${ids.length} recipes deleted successfully` });
  } catch (error) {
    console.error("Error bulk deleting recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
