import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Group by `category` (e.g., Dessert, Main Course) and by `foodCategory` (Savory, Sweet...)
    const categories = await prisma.recipe.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const foodCategories = await prisma.recipe.groupBy({
      by: ["foodCategory"],
      _count: { _all: true },
    });

    // Map to client-friendly shape and filter out null/empty names
    const catOut = categories
      .filter((c) => c.category && String(c.category).trim() !== "")
      .map((c) => ({ name: c.category, count: c._count._all }))
      .sort((a, b) => b.count - a.count);

    const foodCatOut = foodCategories
      .filter((c) => c.foodCategory && String(c.foodCategory).trim() !== "")
      .map((c) => ({ name: c.foodCategory, count: c._count._all }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ categories: catOut, foodCategories: foodCatOut });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return NextResponse.json({ categories: [], foodCategories: [] }, { status: 500 });
  }
}
 
