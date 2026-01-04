"use client"
import React from 'react'
import type { Recipe } from '../types'
import type { MatchedRecipe } from '../lib/matching'
import { useLanguage } from './LanguageProvider'

export default function RecipeCard({ m }: { m: MatchedRecipe }) {
  const { lang } = useLanguage()
  const r: Recipe = m.recipe

  const title = r.title[lang]
  const ingredients = r.ingredients[lang]
  const instructions = r.instructions[lang]

  const haveText = lang === 'en' ? `You have ${m.have} ingredients, you need ${m.need} more.` : `আপনার আছে ${m.have} উপকরণ, আরও প্রয়োজন ${m.need}`

  return (
    <article className="bg-white rounded-lg shadow p-4">
      <img src={r.thumbnail} alt={r.title.en} className="w-full h-40 object-cover rounded" />
      <h3 className="mt-3 font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{haveText}</p>
      <div className="mt-2 text-sm">
        <strong>{lang === 'en' ? 'Ingredients' : 'উপকরণ'}:</strong>
        <ul className="list-disc list-inside mt-1">
          {ingredients.map((ing) => (
            <li key={ing}>{ing}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <strong>{lang === 'en' ? 'Instructions' : 'প্রণালী'}:</strong>
        <p className="mt-1">{instructions}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <a href={r.youtubeUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-red-500 text-white rounded">
          {lang === 'en' ? 'Watch' : 'দেখুন'}
        </a>
      </div>
    </article>
  )
}
