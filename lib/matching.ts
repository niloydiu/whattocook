import type { Recipe } from '../types'

export type MatchedRecipe = {
  recipe: Recipe
  have: number
  need: number
  missing: string[]
  matchPercent: number
}

function normalizeEN(s: string) {
  const t = s.trim().toLowerCase()
  // remove trailing punctuation
  const noP = t.replace(/[.,;:]+$/g, '')
  // naive plural handling: drop trailing 's' for longer words
  return noP.replace(/s$/i, (m, offs, str) => (str.length > 3 ? '' : m))
}

function normalizeBN(s: string) {
  return s.trim().toLowerCase()
}

export function extractYouTubeId(url: string) {
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

export function youtubeThumbnailFor(videoId: string) {
  if (!videoId) return ''
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export function matchRecipes(userIngredients: string[], recipes: Recipe[], lang: 'en' | 'bn' = 'en') {
  const pantrySet = new Set(
    userIngredients
      .filter(Boolean)
      .map((p) => (lang === 'en' ? normalizeEN(p) : normalizeBN(p)))
  )

  const results: MatchedRecipe[] = recipes.map((r) => {
    const ingredients = r.ingredients[lang] || []
    const normalized = ingredients.map((ing) => (lang === 'en' ? normalizeEN(ing) : normalizeBN(ing)))

    const missing: string[] = []
    let have = 0

    normalized.forEach((n, idx) => {
      if (pantrySet.has(n)) have += 1
      else missing.push(ingredients[idx])
    })

    const need = missing.length
    const matchPercent = ingredients.length === 0 ? 0 : Math.round((have / ingredients.length) * 100)

    return { recipe: r, have, need, missing, matchPercent }
  })

  results.sort((a, b) => {
    if (a.matchPercent === b.matchPercent) return a.need - b.need
    return b.matchPercent - a.matchPercent
  })

  return results
}
