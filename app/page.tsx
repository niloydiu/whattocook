"use client"
import React, { useState } from 'react'
import { mockRecipes } from '../data/mockData'
import { matchRecipes } from '../lib/matching'
import RecipeCard from '../components/RecipeCard'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../components/LanguageProvider'

export default function Page() {
  const { lang } = useLanguage()
  const [input, setInput] = useState('')
  const [pantry, setPantry] = useState<string[]>([])

  const addIngredient = () => {
    const val = input.trim()
    if (!val) return
    if (!pantry.map((p) => p.toLowerCase()).includes(val.toLowerCase())) {
      setPantry((s) => [...s, val])
    }
    setInput('')
  }

  const removeIngredient = (i: number) => setPantry((s) => s.filter((_, idx) => idx !== i))

  const results = matchRecipes(pantry, mockRecipes, lang)

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lang === 'en' ? 'whattocook?' : 'কি রান্না করব?'}</h1>
        <div className="flex items-center gap-4">
          <LanguageToggle />
        </div>
      </header>

      <section className="mt-6">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium mb-2">{lang === 'en' ? 'Pantry' : 'প্যান্ট্রি'}</label>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
              className="flex-1 px-3 py-2 rounded border"
              placeholder={lang === 'en' ? 'Add ingredient (e.g. Onion)' : 'উপকরণ লিখুন (যেমন: পেঁয়াজ)'}
            />
            <button onClick={addIngredient} className="px-4 py-2 bg-black text-white rounded">
              {lang === 'en' ? 'Add' : 'যোগ করুন'}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pantry.map((p, i) => (
              <span key={p} className="ingredient-chip">
                <span>{p}</span>
                <button onClick={() => removeIngredient(i)} className="text-xs">×</button>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">{lang === 'en' ? 'Results' : 'ফলাফল'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((m) => (
            <RecipeCard key={m.recipe.id} m={m} />
          ))}
        </div>
      </section>
    </main>
  )
}
