"use server";

import prisma from "@/lib/prisma";

export async function getUserFavorites(userId: string) {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId },
      select: { recipeId: true },
    });
    return favs.map((f) => f.recipeId);
  } catch (e) {
    return [];
  }
}

export async function getFavoriteRecipes(userId: string) {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
      },
    });
    return favs.map((f) => f.recipe);
  } catch (e) {
    return [];
  }
}

export async function toggleFavorite(userId: string, recipeId: number) {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { success: true, action: "removed" };
    } else {
      await prisma.favorite.create({
        data: { userId, recipeId },
      });
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return { success: false, error: "Failed to toggle favorite" };
  }
}

export async function getUserWishlist(userId: string) {
  try {
    return await prisma.wishlistIngredient.findMany({
      where: { userId },
      include: { ingredient: true },
    });
  } catch (e) {
    return [];
  }
}

export async function toggleWishlistIngredient(params: {
  userId: string;
  ingredientId?: number;
  name_en: string;
  name_bn?: string;
}) {
  const { userId, ingredientId, name_en, name_bn } = params;
  try {
    // If we have ingredientId, try to find by that, else by name
    const existing = await prisma.wishlistIngredient.findFirst({
      where: {
        userId,
        OR: [ingredientId ? { ingredientId } : {}, { name_en }],
      },
    });

    if (existing) {
      await prisma.wishlistIngredient.delete({
        where: { id: existing.id },
      });
      return { success: true, action: "removed" };
    } else {
      await prisma.wishlistIngredient.create({
        data: { userId, ingredientId, name_en, name_bn },
      });
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return { success: false, error: "Failed to toggle wishlist" };
  }
}

export async function getActiveCookingProgress(userId: string) {
  try {
    return await prisma.cookingProgress.findMany({
      where: { userId, status: "in_progress" },
      include: {
        recipe: {
          include: {
            steps: { orderBy: { step_number: "asc" } },
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
        stepProgress: true,
        ingredientProgress: true,
      },
    });
  } catch (e) {
    return [];
  }
}

export async function startCooking(userId: string, recipeId: number) {
  try {
    const existing = await prisma.cookingProgress.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      // If already completed, restart it? or just return.
      // Let's reopening if completed.
      if (existing.status === "completed") {
        return await prisma.cookingProgress.update({
          where: { id: existing.id },
          data: { status: "in_progress", completedAt: null },
        });
      }
      return existing;
    }

    const newProgress = await prisma.cookingProgress.create({
      data: { userId, recipeId, status: "in_progress" },
    });

    return newProgress;
  } catch (error) {
    console.error("Start cooking error:", error);
    return null;
  }
}

export async function updateStepProgress(
  cookingProgressId: number,
  stepNumber: number,
  isCompleted: boolean
) {
  try {
    return await prisma.cookingStepProgress.upsert({
      where: {
        cookingProgressId_stepNumber: { cookingProgressId, stepNumber },
      },
      update: { isCompleted },
      create: { cookingProgressId, stepNumber, isCompleted },
    });
  } catch (error) {
    console.error("Update step error:", error);
    return null;
  }
}
export async function updateIngredientProgress(
  cookingProgressId: number,
  ingredientId: number,
  isHave: boolean
) {
  try {
    return await prisma.cookingIngredientProgress.upsert({
      where: {
        cookingProgressId_ingredientId: { cookingProgressId, ingredientId },
      },
      update: { isHave },
      create: { cookingProgressId, ingredientId, isHave },
    });
  } catch (error) {
    console.error("Update ingredient error:", error);
    return null;
  }
}
export async function finishCooking(cookingProgressId: number) {
  try {
    return await prisma.cookingProgress.update({
      where: { id: cookingProgressId },
      data: { status: "completed", completedAt: new Date() },
    });
  } catch (error) {
    return null;
  }
}

export async function deleteCookingProgress(cookingProgressId: number) {
  try {
    await prisma.cookingProgress.delete({
      where: { id: cookingProgressId },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
