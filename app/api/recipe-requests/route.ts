import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipe-requests - List all recipe requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.requestType = type;

    const [requests, total] = await Promise.all([
      prisma.recipeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.recipeRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recipe requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/recipe-requests - Create a new recipe request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestType,
      title,
      description,
      userEmail,
      userName,
      recipeData,
      ingredients,
      recipeName,
      youtubeUrl,
    } = body;

    if (!requestType || !["submit", "by-ingredients", "by-name"].includes(requestType)) {
      return NextResponse.json(
        { error: "Invalid request type. Must be: submit, by-ingredients, or by-name" },
        { status: 400 }
      );
    }

    // Validate based on request type
    if (requestType === "submit" && !recipeData) {
      return NextResponse.json(
        { error: "Recipe data is required for submit type" },
        { status: 400 }
      );
    }

    if (requestType === "by-ingredients" && (!ingredients || ingredients.length === 0)) {
      return NextResponse.json(
        { error: "At least one ingredient is required" },
        { status: 400 }
      );
    }

    if (requestType === "by-name" && !recipeName && !youtubeUrl) {
      return NextResponse.json(
        { error: "Recipe name or YouTube URL is required" },
        { status: 400 }
      );
    }

    const recipeRequest = await prisma.recipeRequest.create({
      data: {
        requestType,
        title,
        description,
        userEmail,
        userName,
        recipeData: recipeData || undefined,
        ingredients: ingredients || [],
        recipeName,
        youtubeUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Recipe request submitted successfully!",
        request: recipeRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating recipe request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
