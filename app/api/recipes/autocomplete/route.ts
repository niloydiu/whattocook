import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Search for recipes matching the title
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { title_en: { contains: q, mode: "insensitive" } },
          { title_bn: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title_en: true,
        title_bn: true,
        slug: true,
      },
      take: 5,
    });

    // Also suggest categories if they match
    const CATEGORIES = [
      "Savory",
      "Sweet",
      "Spicy",
      "Sour",
      "Dessert",
      "Drinks",
      "Appetizer",
      "Soup",
      "Salad",
    ];
    const categorySuggestions = CATEGORIES.filter((c) =>
      c.toLowerCase().includes(q.toLowerCase())
    ).map((c) => ({ type: "category", label: c }));

    const recipeSuggestions = recipes.map((r) => ({
      type: "recipe",
      label: r.title_en,
      label_bn: r.title_bn,
      slug: r.slug,
    }));

    return NextResponse.json({
      suggestions: [...categorySuggestions, ...recipeSuggestions],
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
