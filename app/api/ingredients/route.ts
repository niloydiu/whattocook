import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/ingredients - Search ingredients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Exact lookup by name (returns single ingredient or 404)
    const nameParam = searchParams.get("name");
    if (nameParam && nameParam.trim()) {
      const name = nameParam.trim();
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          OR: [
            { name_en: { equals: name, mode: "insensitive" as const } },
            { name_bn: { equals: name } },
            { phonetic: { has: name.toLowerCase() } },
          ],
        },
      });

      if (!ingredient) {
        return NextResponse.json(
          { error: "Ingredient not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ ingredient });
    }

    // Otherwise do paginated/partial search
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

// POST /api/ingredients - Find by name or create minimal ingredient
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown> | null;
    const rawName = (body && (body.name || body.name_en || body.name_bn)) || "";
    const name = String(rawName).trim();

    if (!name) {
      return NextResponse.json(
        { error: "Missing 'name' in request body" },
        { status: 400 }
      );
    }

    // try to find existing ingredient by English/Bengali name or phonetic
    const found = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name_en: { equals: name, mode: "insensitive" as const } },
          { name_bn: { equals: name } },
          { phonetic: { has: name.toLowerCase() } },
        ],
      },
    });

    if (found) {
      return NextResponse.json({ ingredient: found });
    }

    // create a minimal ingredient record with provided name as English name
    const created = await prisma.ingredient.create({
      data: { name_en: name },
    });

    return NextResponse.json(
      { ingredient: created, created: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/ingredients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
