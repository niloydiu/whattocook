import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, getAdminFromRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { validateBody, IngredientMergeSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = validateBody(IngredientMergeSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.errors }, { status: 400 });
    }

    const { sourceId, targetId } = validation.data;

    if (sourceId === targetId) {
      return NextResponse.json({ error: "Cannot merge an ingredient into itself" }, { status: 400 });
    }

    const [source, target] = await Promise.all([
      prisma.ingredient.findUnique({ where: { id: sourceId } }),
      prisma.ingredient.findUnique({ where: { id: targetId } }),
    ]);

    if (!source || !target) {
      return NextResponse.json({ error: "Source or target ingredient not found" }, { status: 404 });
    }

    // Move all recipe ingredient references from source to target
    // Handle potential unique constraint violations (recipe already uses target)
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { ingredient_id: sourceId },
    });

    for (const ri of recipeIngredients) {
      const existingTarget = await prisma.recipeIngredient.findUnique({
        where: { recipe_id_ingredient_id: { recipe_id: ri.recipe_id, ingredient_id: targetId } },
      });

      if (existingTarget) {
        // Recipe already has the target ingredient — delete the duplicate reference
        await prisma.recipeIngredient.delete({ where: { id: ri.id } });
      } else {
        // Re-point to target
        await prisma.recipeIngredient.update({
          where: { id: ri.id },
          data: { ingredient_id: targetId },
        });
      }
    }

    // Move allergy references
    const allergies = await prisma.userAllergy.findMany({ where: { ingredientId: sourceId } });
    for (const a of allergies) {
      await prisma.userAllergy.update({ where: { id: a.id }, data: { ingredientId: targetId } });
    }

    // Move wishlist references
    const wishlist = await prisma.wishlistIngredient.findMany({ where: { ingredientId: sourceId } });
    for (const w of wishlist) {
      await prisma.wishlistIngredient.update({ where: { id: w.id }, data: { ingredientId: targetId } });
    }

    // Add source name as synonym on target
    const newSynonyms = [...new Set([...target.synonyms, source.name_en, ...(source.synonyms || [])])];
    await prisma.ingredient.update({
      where: { id: targetId },
      data: { synonyms: newSynonyms },
    });

    // Delete source ingredient
    await prisma.ingredient.delete({ where: { id: sourceId } });

    // Audit log
    const admin = await getAdminFromRequest(request);
    if (admin) {
      await logAudit({
        adminId: admin.sub,
        action: "ingredient.merge",
        entityType: "ingredient",
        entityId: targetId,
        details: `Merged ingredient #${sourceId} "${source.name_en}" into #${targetId} "${target.name_en}"`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Merged "${source.name_en}" into "${target.name_en}"`,
      merged: { sourceId, targetId, movedRecipes: recipeIngredients.length },
    });
  } catch (error) {
    console.error("Error merging ingredients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
