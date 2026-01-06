import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stats = await prisma.recipe.groupBy({
      by: ["foodCategory"],
      _count: {
        id: true,
      },
      where: {
        foodCategory: {
          not: null,
        },
      },
    });

    const categories = stats.map((s) => ({
      name: s.foodCategory,
      count: s._count.id,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch category stats:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
