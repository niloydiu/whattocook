"use server";

import prisma from "@/lib/prisma";

export async function getRecipeCategories() {
  try {
    const categories = await prisma.recipe.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const foodCategories = await prisma.recipe.groupBy({
      by: ["foodCategory"],
      _count: { _all: true },
    });

    const catOut = categories
      .filter((c) => c.category && String(c.category).trim() !== "")
      .map((c) => ({
        name: c.category!,
        count: c._count._all,
        type: "category" as const,
      }))
      .sort((a, b) => b.count - a.count);

    const foodCatOut = foodCategories
      .filter((c) => c.foodCategory && String(c.foodCategory).trim() !== "")
      .map((c) => ({
        name: c.foodCategory!,
        count: c._count._all,
        type: "foodCategory" as const,
      }))
      .sort((a, b) => b.count - a.count);

    return { categories: catOut, foodCategories: foodCatOut };
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return { categories: [], foodCategories: [] };
  }
}

export async function getTotalRecipeCount() {
  try {
    const count = await prisma.recipe.count();
    return count;
  } catch (error) {
    console.error("Error fetching total recipe count:", error);
    return 0;
  }
}

export async function getRecipes(params: {
  search?: string;
  category?: string;
  foodCategory?: string;
  limit?: number;
  page?: number;
}) {
  const { search, category, foodCategory, limit = 12, page = 1 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    const searchTerm = search.trim();
    where.OR = [
      { title_en: { contains: searchTerm, mode: "insensitive" } },
      { title_bn: { contains: searchTerm } },
      { cuisine: { contains: searchTerm, mode: "insensitive" } },
      { category: { contains: searchTerm, mode: "insensitive" } },
      { foodCategory: { contains: searchTerm, mode: "insensitive" } },
      {
        ingredients: {
          some: {
            ingredient: {
              OR: [
                { name_en: { contains: searchTerm, mode: "insensitive" } },
                { name_bn: { contains: searchTerm } },
              ],
            },
          },
        },
      },
    ];
  }

  if (category) where.category = category;
  if (foodCategory) where.foodCategory = foodCategory;

  try {
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

    // Convert createdAt to string for JSON serialization
    const recipesWithStringDates = recipes.map((recipe) => ({
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
    }));

    // Also get 3 featured recipes if it's a search
    let featured: any[] = [];
    if (search || category || foodCategory) {
      const fetched = await prisma.recipe.findMany({
        take: 3,
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
      });

      const existingIds = new Set(recipes.map((r) => r.id));
      featured = fetched
        .filter((f) => !existingIds.has(f.id))
        .map((recipe) => ({
          ...recipe,
          createdAt: recipe.createdAt.toISOString(),
        }));
    }

    return {
      recipes: recipesWithStringDates,
      featured,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw new Error("Failed to fetch recipes");
  }
}

export async function getRecipeBySlug(slug: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        steps: {
          orderBy: {
            step_number: "asc",
          },
        },
        blogContent: true,
      },
    });
    return recipe;
  } catch (error) {
    console.error("Error fetching recipe by slug:", error);
    return null;
  }
}

export async function getYouTubeMetadata(videoId: string) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/var ytInitialPlayerResponse = ({.+?});var/);

    if (match && match[1]) {
      const playerResponse = JSON.parse(match[1]);
      const videoDetails = playerResponse.videoDetails;
      const microformat = playerResponse.microformat?.playerMicroformatRenderer;

      if (videoDetails) {
        const seconds = parseInt(videoDetails.lengthSeconds || "0");
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const duration = `${minutes}:${remainingSeconds
          .toString()
          .padStart(2, "0")}`;
        const views = parseInt(videoDetails.viewCount || "0");
        const viewCount = views.toLocaleString();

        return {
          title: videoDetails.title,
          duration,
          durationSeconds: seconds,
          viewCount,
          views,
          author: videoDetails.author,
          thumbnail: videoDetails.thumbnail?.thumbnails?.slice(-1)[0]?.url,
          publishDate: microformat?.publishDate,
          uploadDate: microformat?.uploadDate,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching YouTube metadata in action:", error);
    return null;
  }
}
