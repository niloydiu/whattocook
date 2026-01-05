import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/ingredients - Search ingredients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name_en: { contains: search, mode: "insensitive" as const } },
            { name_bn: { contains: search } },
          ],
        }
      : {};

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name_en: "asc" },
        select: {
          id: true,
          name_en: true,
          name_bn: true,
          img: true,
        },
      }),
      prisma.ingredient.count({ where }),
    ]);

    return NextResponse.json({
      ingredients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
