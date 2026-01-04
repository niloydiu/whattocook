import type { Recipe } from '../types'
import recipeData from './recipeData.json'

// Lightweight normalizers
const normalizeEN = (s: string) => s.trim().toLowerCase().replace(/[.,;:]+$/g, '')
const normalizeBN = (s: string) => s.trim().toLowerCase()

export type SimpleRecipe = Recipe

export type MatchResult = {
  recipe: SimpleRecipe
  have: number
  need: number
  missing: string[]
  matchPercent: number
}

export function getYoutubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function extractVideoId(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.searchParams.has('v')) return u.searchParams.get('v') || ''
    const parts = u.pathname.split('/').filter(Boolean)
    return parts.length ? parts[parts.length - 1] : ''
  } catch (e) {
    return ''
  }
}

// High-performance client-side matcher
export function matchRecipesClient(selectedIngredients: string[], locale: 'en' | 'bn' = 'en') {
  const norm = (s: string) => (locale === 'en' ? normalizeEN(s) : normalizeBN(s))
  const pantry = new Set(selectedIngredients.filter(Boolean).map(norm))

  const results: MatchResult[] = (recipeData as SimpleRecipe[]).map((r) => {
    const ingredients = r.ingredients[locale] || []
    let have = 0
    const missing: string[] = []

    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i]
      if (pantry.has(norm(ing))) have++
      else missing.push(ing)
    }

    const need = missing.length
    const matchPercent = ingredients.length === 0 ? 0 : Math.round((have / ingredients.length) * 100)

    return { recipe: r as SimpleRecipe, have, need, missing, matchPercent }
  })

  results.sort((a, b) => {
    if (b.matchPercent === a.matchPercent) return a.need - b.need
    return b.matchPercent - a.matchPercent
  })

  return results
}

export const allRecipes = recipeData as SimpleRecipe[]
