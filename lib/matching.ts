import type { Recipe } from '../types'

export type MatchedRecipe = {
  recipe: Recipe
  have: number
  need: number
  missing: string[]
  matchRatio: number
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

export function matchRecipes(pantry: string[], recipes: Recipe[], lang: 'en' | 'bn' = 'en') {
  const pantrySet = new Set(pantry.map(normalize))

  const results: MatchedRecipe[] = recipes.map((r) => {
    const ingredients = r.ingredients[lang]
    const normalized = ingredients.map(normalize)
    const haveList = normalized.filter((ing) => pantrySet.has(ing))
    const missing = normalized.filter((ing) => !pantrySet.has(ing))
    const have = haveList.length
    const need = missing.length
    const matchRatio = ingredients.length === 0 ? 0 : have / ingredients.length
    return { recipe: r, have, need, missing, matchRatio }
  })

  // Sort: full matches first (matchRatio === 1), then descending matchRatio, then fewer missing
  results.sort((a, b) => {
    if (a.matchRatio === b.matchRatio) return a.need - b.need
    return b.matchRatio - a.matchRatio
  })

  return results
}
