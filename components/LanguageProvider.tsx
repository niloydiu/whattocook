"use client"
import React, { createContext, useContext, useState } from 'react'

type Lang = 'en' | 'bn'

const LanguageContext = createContext({
  lang: 'en' as Lang,
  setLang: (l: Lang) => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
