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
    const sortField = searchParams.get("sortField") || "id";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";

    const skip = (page - 1) * limit;

    let where: any = search
      ? {
          OR: [
            { name_en: { contains: search, mode: "insensitive" as const } },
            { name_bn: { contains: search } },
          ],
        }
      : {};

    const hasImageParam = searchParams.get("hasImage");
    if (hasImageParam === "true") {
      const imgCond = { img: { not: "" } };
      where = Object.keys(where).length ? { AND: [where, imgCond] } : imgCond;
    } else if (hasImageParam === "false") {
      const imgCond = { img: "" };
      where = Object.keys(where).length ? { AND: [where, imgCond] } : imgCond;
    }

    // Validate sort field against allowed keys to avoid injection
    const allowedSortFields: Record<string, any> = {
      id: { id: sortOrder },
      name_en: { name_en: sortOrder },
      name_bn: { name_bn: sortOrder },
      createdAt: { createdAt: sortOrder },
      updatedAt: { updatedAt: sortOrder },
    };

    const orderBy = allowedSortFields[sortField] || { id: sortOrder };

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

// DELETE /api/admin/ingredients - Bulk delete ingredients
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid ingredient IDs provided" },
        { status: 400 }
      );
    }

    await prisma.ingredient.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ message: `${ids.length} ingredients deleted successfully` });
  } catch (error) {
    console.error("Error bulk deleting ingredients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
