import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateBody, RatingSchema } from "@/lib/validation/schemas";

// GET /api/recipes/[slug]/ratings - Get ratings for a recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const [ratings, stats] = await Promise.all([
      prisma.rating.findMany({
        where: { recipeId: recipe.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.rating.aggregate({
        where: { recipeId: recipe.id },
        _avg: { score: true },
        _count: { score: true },
      }),
    ]);

    return NextResponse.json({
      ratings,
      average: stats._avg.score ?? 0,
      count: stats._count.score,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recipes/[slug]/ratings - Submit a rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = validateBody(RatingSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.errors }, { status: 400 });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_recipeId: { userId, recipeId: recipe.id },
      },
      update: {
        score: validation.data.score,
        review: validation.data.review ?? null,
      },
      create: {
        userId,
        recipeId: recipe.id,
        score: validation.data.score,
        review: validation.data.review ?? null,
      },
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
