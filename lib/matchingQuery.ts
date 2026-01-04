import { supabaseAdmin } from "./supabaseClient";

type RecipeRow = {
  id: string;
  title_en: string;
  title_bn: string;
  youtube_url: string;
  thumbnail: string | null;
  ingredients_en: string[];
  ingredients_bn: string[];
  instructions_en: string;
  instructions_bn: string;
};

export type RecipeMatch = {
  recipe: RecipeRow;
  matches: number;
  total: number;
  score: number; // percent 0-100
  missing: string[];
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export async function queryRecipesByPantry(
  pantry: string[],
  locale: "en" | "bn" = "en",
  limit = 100
): Promise<RecipeMatch[]> {
  if (!supabaseAdmin)
    throw new Error(
      "supabaseAdmin is not configured; set SUPABASE_SERVICE_ROLE_KEY"
    );

  const col = locale === "en" ? "ingredients_en" : "ingredients_bn";

  const normPantry = pantry.map((p) => normalize(p)).filter(Boolean);
  if (normPantry.length === 0) {
    // fetch top recipes if no pantry provided
    const { data } = await supabaseAdmin
      .from("recipes")
      .select("*")
      .limit(limit);
    return (data || []).map((r: any) => ({
      recipe: r as RecipeRow,
      matches: 0,
      total: (r[col] || []).length,
      score: 0,
      missing: r[col] || [],
    }));
  }

  // Server-side filter: overlap between recipe ingredients and pantry
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    // .overlaps will translate to SQL `&&` operator
    .overlaps(col, normPantry)
    .limit(limit);

  if (error) throw error;

  const results: RecipeMatch[] = (data || []).map((r: any) => {
    const recipeIngs: string[] = r[col] || [];
    const normalizedRecipe = recipeIngs.map(normalize);
    const pantrySet = new Set(normPantry);
    let matches = 0;
    const missing: string[] = [];

    for (let i = 0; i < recipeIngs.length; i++) {
      const ing = recipeIngs[i];
      if (pantrySet.has(normalize(ing))) matches++;
      else missing.push(ing);
    }

    const total = recipeIngs.length;
    const score = total === 0 ? 0 : Math.round((matches / total) * 100);

    return { recipe: r as RecipeRow, matches, total, score, missing };
  });

  // sort by score desc, then fewer missing
  results.sort((a, b) =>
    b.score === a.score
      ? a.missing.length - b.missing.length
      : b.score - a.score
  );

  return results;
}
