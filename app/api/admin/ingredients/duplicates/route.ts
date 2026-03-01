import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";
import { normalizeIngredientName, stringSimilarity } from "@/lib/ingredientNormalization";

interface DuplicateGroup {
  canonical: string;
  ingredients: Array<{
    id: number;
    name_en: string;
    name_bn: string;
    recipeCount: number;
    similarity: number;
  }>;
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth(request))) {
    return unauthorizedResponse();
  }

  try {
    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name_en: true,
        name_bn: true,
        synonyms: true,
        _count: { select: { recipeIngredients: true } },
      },
      orderBy: { name_en: "asc" },
    });

    // Group ingredients by normalized name
    const normalizedGroups = new Map<string, typeof ingredients>();

    for (const ing of ingredients) {
      const norm = normalizeIngredientName(ing.name_en);
      if (!normalizedGroups.has(norm)) {
        normalizedGroups.set(norm, []);
      }
      normalizedGroups.get(norm)!.push(ing);
    }

    // Only return groups with more than one ingredient (actual duplicates)
    const duplicateGroups: DuplicateGroup[] = [];
    for (const [canonical, group] of normalizedGroups) {
      if (group.length > 1) {
        duplicateGroups.push({
          canonical,
          ingredients: group.map((ing) => ({
            id: ing.id,
            name_en: ing.name_en,
            name_bn: ing.name_bn,
            recipeCount: ing._count.recipeIngredients,
            similarity: stringSimilarity(
              normalizeIngredientName(ing.name_en),
              canonical
            ),
          })),
        });
      }
    }

    // Also find fuzzy matches that didn't group by exact normalized name
    const allNormalized = ingredients.map((ing) => ({
      ...ing,
      normalized: normalizeIngredientName(ing.name_en),
    }));

    for (let i = 0; i < allNormalized.length; i++) {
      for (let j = i + 1; j < allNormalized.length; j++) {
        const sim = stringSimilarity(allNormalized[i].normalized, allNormalized[j].normalized);
        if (sim >= 0.85 && allNormalized[i].normalized !== allNormalized[j].normalized) {
          // Check if already in a group
          const existsInGroup = duplicateGroups.some(
            (g) =>
              g.ingredients.some((x) => x.id === allNormalized[i].id) &&
              g.ingredients.some((x) => x.id === allNormalized[j].id)
          );
          if (!existsInGroup) {
            duplicateGroups.push({
              canonical: allNormalized[i].normalized,
              ingredients: [
                {
                  id: allNormalized[i].id,
                  name_en: allNormalized[i].name_en,
                  name_bn: allNormalized[i].name_bn,
                  recipeCount: allNormalized[i]._count.recipeIngredients,
                  similarity: 1,
                },
                {
                  id: allNormalized[j].id,
                  name_en: allNormalized[j].name_en,
                  name_bn: allNormalized[j].name_bn,
                  recipeCount: allNormalized[j]._count.recipeIngredients,
                  similarity: sim,
                },
              ],
            });
          }
        }
      }
    }

    return NextResponse.json({
      duplicateGroups,
      totalGroups: duplicateGroups.length,
    });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
