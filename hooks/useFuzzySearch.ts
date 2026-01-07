import { useMemo, createElement } from "react";
import Fuse, { FuseResult, FuseResultMatch } from "fuse.js";
import {
  normalizePhonetic,
  romanizeBangla,
  generatePhoneticVariations,
} from "../lib/phoneticUtils";

export type Ingredient = {
  id: string | number;
  name_en: string;
  name_bn: string;
  img: string;
  phonetic?: string | string[];
};

/**
 * Enhanced ingredient with searchable fields for Fuse.js
 */
type SearchableIngredient = Ingredient & {
  searchableText: string;
  phoneticVariations: string[];
  romanizedBangla: string;
};

/**
 * Prepare ingredients for fuzzy search by enriching them with searchable data
 */
function prepareIngredientsForSearch(
  ingredients: Ingredient[]
): SearchableIngredient[] {
  return ingredients.map((ingredient) => {
    // Generate phonetic variations if not present
    const phoneticArray = ingredient.phonetic
      ? Array.isArray(ingredient.phonetic)
        ? ingredient.phonetic
        : [ingredient.phonetic]
      : generatePhoneticVariations(ingredient.name_en);

    // Romanize Bangla name for better fuzzy matching
    const romanizedBangla = romanizeBangla(ingredient.name_bn);

    // Create a comprehensive searchable text
    const searchableText = [
      ingredient.name_en.toLowerCase(),
      ingredient.name_bn,
      romanizedBangla,
      ...phoneticArray.map((p) => p.toLowerCase()),
    ].join(" ");

    return {
      ...ingredient,
      searchableText,
      phoneticVariations: phoneticArray.map((p) => p.toLowerCase()),
      romanizedBangla,
    };
  });
}

/**
 * Hook for fuzzy search across ingredients with English, Bangla, and Phonetic support
 */
export function useFuzzyIngredientSearch(
  ingredients: Ingredient[],
  query: string,
  options?: {
    limit?: number;
    threshold?: number;
  }
) {
  const { limit = 8, threshold = 0.35 } = options || {};

  // Memoize the searchable ingredients
  const searchableIngredients = useMemo(
    () => prepareIngredientsForSearch(ingredients),
    [ingredients]
  );

  // Initialize Fuse.js with optimized configuration
  const fuse = useMemo(() => {
    return new Fuse(searchableIngredients, {
      keys: [
        { name: "name_en", weight: 2 }, // Highest priority for English name
        { name: "name_bn", weight: 2 }, // Equal priority for Bangla name
        { name: "phoneticVariations", weight: 1.5 }, // High priority for phonetic
        { name: "romanizedBangla", weight: 1.5 }, // Romanized Bangla for transliteration
        { name: "searchableText", weight: 1 }, // Fallback comprehensive search
      ],
      threshold, // 0.35 is the sweet spot for catching variations
      ignoreLocation: true, // Match anywhere in the string
      findAllMatches: true, // Find all possible matches
      minMatchCharLength: 2, // Minimum 2 characters to match
      useExtendedSearch: false, // Standard fuzzy search
      includeScore: true, // Include score for ranking
      includeMatches: true, // Include match indices for highlighting
    });
  }, [searchableIngredients, threshold]);

  // Perform the search
  const results = useMemo(() => {
    if (!query || query.trim().length < 1) {
      return searchableIngredients.slice(0, limit).map((item) => ({
        ingredient: item as Ingredient,
        score: 0,
        matches: [],
        isClosestGuess: false,
      }));
    }

    // Normalize the query
    const normalizedQuery = normalizePhonetic(query.trim().toLowerCase());

    // Search with Fuse.js
    const fuseResults = fuse.search(normalizedQuery);

    // Deduplicate by ingredient id keeping the best (lowest) score
    const bestById = new Map<
      string,
      {
        ingredient: Ingredient;
        score: number;
        matches: readonly FuseResultMatch[] | undefined;
      }
    >();

    for (const r of fuseResults) {
      const id = String((r.item as Ingredient).id);
      const existing = bestById.get(id);
      const score = typeof r.score === "number" ? r.score : 0;
      if (!existing || score < existing.score) {
        bestById.set(id, {
          ingredient: r.item as Ingredient,
          score,
          matches: r.matches,
        });
      }
    }

    // Convert map to array and sort by best score ascending
    const deduped = Array.from(bestById.values())
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((v) => ({
        ingredient: v.ingredient,
        score: v.score,
        matches: v.matches || [],
        isClosestGuess: v.score > 0.3,
      }));

    return deduped;
  }, [query, fuse, searchableIngredients, limit]);

  return results;
}

/**
 * Highlight matched portions of text
 */
export function highlightMatch(
  text: string,
  matches: readonly FuseResultMatch[]
): React.ReactNode {
  if (!matches || matches.length === 0) {
    return text;
  }

  // Find the match for this specific text field
  const match = matches.find((m) => {
    const value = typeof m.value === "string" ? m.value : "";
    return (
      value.toLowerCase().includes(text.toLowerCase()) ||
      text.toLowerCase().includes(value.toLowerCase())
    );
  });

  if (!match || !match.indices || match.indices.length === 0) {
    return text;
  }

  const indices = match.indices[0];
  const start = indices[0];
  const end = indices[1] + 1;

  const before = text.slice(0, start);
  const highlighted = text.slice(start, end);
  const after = text.slice(end);

  return createElement(
    "span",
    { key: text },
    before,
    createElement(
      "span",
      {
        className: "bg-red-100 text-red-600 font-black rounded px-0.5",
        key: "highlight",
      },
      highlighted
    ),
    after
  );
}
