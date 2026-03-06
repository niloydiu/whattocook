/**
 * Multi-layer ingredient matching to prevent duplicates.
 * Matches against existing database ingredients using:
 * 1. Exact name match (case-insensitive)
 * 2. Synonym/canonical name match
 * 3. Normalized name match (prefix stripped, singularized)
 * 4. Fuzzy/Levenshtein match (> 0.85 similarity)
 * 5. Phonetic match for Bangla transliterations
 */

import prisma from "./prisma";
import {
  normalizeIngredientName,
  getCanonicalName,
  stringSimilarity,
} from "./ingredientNormalization";

export interface MatchResult {
  ingredient: {
    id: number;
    name_en: string;
    name_bn: string;
    synonyms: string[];
  };
  confidence: number; // 0-1
  matchType: "exact" | "synonym" | "normalized" | "fuzzy" | "phonetic" | "new";
}

interface IngredientRecord {
  id: number;
  name_en: string;
  name_bn: string;
  phonetic: string[];
  synonyms: string[];
}

/**
 * Find the best matching ingredient from the database.
 * Returns match result with confidence score.
 */
export async function findBestMatch(
  nameEn: string | undefined,
  nameBn: string | undefined
): Promise<MatchResult | null> {
  if (!nameEn && !nameBn) return null;

  const allIngredients = await prisma.ingredient.findMany({
    select: { id: true, name_en: true, name_bn: true, phonetic: true, synonyms: true },
  });

  return findBestMatchFromList(nameEn, nameBn, allIngredients);
}

/**
 * Find best match from a pre-loaded list (for batch operations).
 */
export function findBestMatchFromList(
  nameEn: string | undefined,
  nameBn: string | undefined,
  allIngredients: IngredientRecord[]
): MatchResult | null {
  const searchEn = nameEn?.trim().toLowerCase();
  const searchBn = nameBn?.trim();

  let bestMatch: MatchResult | null = null;

  for (const ing of allIngredients) {
    const ingEnLower = ing.name_en.toLowerCase();

    // Layer 1: Exact match (confidence 1.0)
    if (searchEn && ingEnLower === searchEn) {
      return { ingredient: ing, confidence: 1.0, matchType: "exact" };
    }
    if (searchBn && ing.name_bn === searchBn) {
      return { ingredient: ing, confidence: 1.0, matchType: "exact" };
    }

    // Layer 1b: Synonym field match
    if (searchEn && ing.synonyms.some(s => s.toLowerCase() === searchEn)) {
      return { ingredient: ing, confidence: 0.98, matchType: "synonym" };
    }

    // Layer 2: Canonical synonym match
    if (searchEn) {
      const searchCanonical = getCanonicalName(searchEn);
      const ingCanonical = getCanonicalName(ingEnLower);
      if (searchCanonical && ingCanonical && searchCanonical === ingCanonical) {
        return { ingredient: ing, confidence: 0.95, matchType: "synonym" };
      }
    }

    // Layer 3: Normalized name match
    if (searchEn) {
      const searchNorm = normalizeIngredientName(searchEn);
      const ingNorm = normalizeIngredientName(ingEnLower);
      if (searchNorm === ingNorm) {
        const score = 0.90;
        if (!bestMatch || score > bestMatch.confidence) {
          bestMatch = { ingredient: ing, confidence: score, matchType: "normalized" };
        }
        continue;
      }
    }

    // Layer 4: Fuzzy string match
    if (searchEn) {
      const sim = stringSimilarity(
        normalizeIngredientName(searchEn),
        normalizeIngredientName(ingEnLower)
      );
      if (sim >= 0.85) {
        const score = sim * 0.9; // Scale to max 0.9
        if (!bestMatch || score > bestMatch.confidence) {
          bestMatch = { ingredient: ing, confidence: score, matchType: "fuzzy" };
        }
      }
    }

    // Layer 5: Phonetic match for Bangla
    if (searchEn && ing.phonetic.length > 0) {
      const searchLower = searchEn.toLowerCase();
      for (const p of ing.phonetic) {
        if (p.toLowerCase() === searchLower || stringSimilarity(p.toLowerCase(), searchLower) >= 0.85) {
          const score = 0.80;
          if (!bestMatch || score > bestMatch.confidence) {
            bestMatch = { ingredient: ing, confidence: score, matchType: "phonetic" };
          }
          break;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Find or create ingredient with dedup matching.
 * Used during recipe import to prevent creating duplicates.
 */
export async function findOrCreateIngredientSmart(data: {
  name_en?: string;
  name_bn?: string;
  img?: string;
  phonetic?: string[];
}): Promise<{ ingredient: IngredientRecord & { img: string }; isNew: boolean; matchType: string }> {
  const nameEn = data.name_en?.trim() ?? "";
  const nameBn = data.name_bn?.trim() ?? "";

  const match = await findBestMatch(nameEn || undefined, nameBn || undefined);

  if (match && match.confidence >= 0.85) {
    const full = await prisma.ingredient.findUnique({ where: { id: match.ingredient.id } });
    return {
      ingredient: full!,
      isNew: false,
      matchType: match.matchType,
    };
  }

  // No good match found — create new ingredient
  const created = await prisma.ingredient.create({
    data: {
      name_en: nameEn,
      name_bn: nameBn,
      img: data.img ?? "",
      phonetic: data.phonetic ?? [],
      synonyms: [],
    },
  });

  return {
    ingredient: created,
    isNew: true,
    matchType: "new",
  };
}
