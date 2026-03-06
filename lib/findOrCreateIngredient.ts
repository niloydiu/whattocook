import { findOrCreateIngredientSmart } from "./ingredientMatcher";

/**
 * Find or create an ingredient with smart dedup matching.
 * This is a thin wrapper around findOrCreateIngredientSmart
 * that maintains the original API surface.
 */
export async function findOrCreateIngredient(data: {
  name_en?: string;
  name_bn?: string;
  img?: string;
  phonetic?: string[];
}) {
  const result = await findOrCreateIngredientSmart(data);
  return result.ingredient;
}

export default findOrCreateIngredient;
