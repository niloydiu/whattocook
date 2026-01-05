import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

// GET /api/admin/ingredients - Get all ingredients with pagination
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

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
        orderBy: { id: "asc" },
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

// POST /api/admin/ingredients - Create a new ingredient
export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();

    const ingredient = await prisma.ingredient.create({
      data: {
        name_en: data.name_en,
        name_bn: data.name_bn,
        img: data.img,
        phonetic: data.phonetic || [],
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
