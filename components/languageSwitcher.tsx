"use client"
import React from 'react'
import { useLanguage } from './LanguageProvider'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex items-center gap-2">
      <button
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-black text-white' : 'bg-white'}`}>
        EN
      </button>
      <button
        aria-pressed={lang === 'bn'}
        onClick={() => setLang('bn')}
        className={`px-3 py-1 rounded ${lang === 'bn' ? 'bg-black text-white' : 'bg-white'}`}>
        BN
      </button>
    </div>
  )
}
