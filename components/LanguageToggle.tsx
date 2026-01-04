"use client"
import React from 'react'
import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-black text-white' : 'bg-white'}`}>
        EN
      </button>
      <button
        onClick={() => setLang('bn')}
        className={`px-3 py-1 rounded ${lang === 'bn' ? 'bg-black text-white' : 'bg-white'}`}>
        BN
      </button>
    </div>
  )
}
