"use client"
import React, { useMemo, useState } from 'react'
import type { MatchResult } from '../lib/matchingLogic'
import { extractYouTubeId, youtubeThumbnailFor } from '../lib/matching'

type Locale = 'en' | 'bn'

function toBengaliNumber(n: number) {
  const map = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
  return String(n).split('').map((d) => map[+d] ?? d).join('')
}

function missingLabel(lang: 'en' | 'bn', need: number, missing: string[]) {
  if (lang === 'en') {
    if (need === 0) return '0 missing ingredients'
    if (need === 1) return `1 missing ingredient: ${missing.join(', ')}`
    return `${need} missing ingredients: ${missing.join(', ')}`
  }
  // Bangla
  if (need === 0) return `কোন উপকরণ নেই`;
  const bnNum = toBengaliNumber(need)
  return `${bnNum}টি উপকরণ নেই: ${missing.join(', ')}`
}

export default function RecipeCard({ result, locale = 'en' }: { result: MatchResult; locale?: Locale }) {
  const m = result
  const r = m.recipe
  const videoId = useMemo(() => extractYouTubeId(r.youtubeUrl), [r.youtubeUrl])
  const thumbnail = videoId ? youtubeThumbnailFor(videoId) : r.thumbnail
  const [open, setOpen] = useState(false)

  const haveText =
    locale === 'en'
      ? `You have ${m.have} ingredients, you need ${m.need} more.`
      : `আপনার আছে ${toBengaliNumber(m.have)} উপকরণ, আরও প্রয়োজন ${toBengaliNumber(m.need)}`

  return (
    <article className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={r.title.en} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg">{r.title[locale]}</h3>
        <div className="text-sm text-gray-600 mt-1">{haveText}</div>
        <div className="mt-2 text-sm">
          <strong>{locale === 'en' ? 'Match %' : 'মিল %'}: </strong>
          <span className="font-medium">{m.matchPercent}%</span>
        </div>

        <div className="mt-2 text-sm">
          <strong>{locale === 'en' ? 'Ingredients' : 'উপকরণ'}: </strong>
          <div className="text-sm text-gray-700 mt-1">
            <ul className="list-inside">
              {r.ingredients[locale].map((ing) => {
                const isMissing = m.missing.includes(ing)
                return (
                  <li key={ing} className={`${isMissing ? 'text-red-600' : 'text-green-600'}`}>
                    {isMissing ? (locale === 'en' ? `✖ ${ing}` : `✖ ${ing}`) : (locale === 'en' ? `✓ ${ing}` : `✓ ${ing}`)}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={() => setOpen(true)} className="px-3 py-1 bg-red-500 text-white rounded">
            {locale === 'en' ? 'Watch Tutorial' : 'টিউটোরিয়াল দেখুন'}
          </button>
          <a href={r.youtubeUrl} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">
            {locale === 'en' ? 'Open in YouTube' : 'ইউটিউবে খুলুন'}
          </a>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-3xl bg-white rounded p-2">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="px-2 py-1">✕</button>
            </div>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={r.title.en}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
        <a
          href={r.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          {lang === "en" ? "Watch" : "দেখুন"}
        </a>
      </div>
    </article>
  );
}
