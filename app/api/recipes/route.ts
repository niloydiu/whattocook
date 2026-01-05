import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipes - Search and get recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title_en: { contains: search, mode: "insensitive" } },
        { title_bn: { contains: search } },
      ];
    }

    if (cuisine) where.cuisine = cuisine;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title_en: true,
          title_bn: true,
          image: true,
          cuisine: true,
          category: true,
          difficulty: true,
          prep_time: true,
          cook_time: true,
          servings: true,
          createdAt: true,
        },
      }),
      prisma.recipe.count({ where }),
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
