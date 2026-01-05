import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipes/[slug] - Get a single recipe by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name_en: true,
                name_bn: true,
                img: true,
              },
            },
          },
          orderBy: { id: "asc" },
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
