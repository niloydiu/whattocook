import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

// GET /api/admin/ingredients/[id] - Get a single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/ingredients/[id] - Update an ingredient
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

    const ingredient = await prisma.ingredient.update({
      where: { id: parseInt(id) },
      data: {
        name_en: data.name_en,
        name_bn: data.name_bn,
        img: data.img,
        phonetic: data.phonetic || [],
      },
    });

    return NextResponse.json(ingredient);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ingredients/[id] - Delete an ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    await prisma.ingredient.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
