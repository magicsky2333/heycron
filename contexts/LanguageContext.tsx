'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'zh' | 'en'

type LanguageContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  isZh: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  setLang: () => {},
  isZh: true,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('heycron-lang') as Lang
    if (saved === 'en' || saved === 'zh') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('heycron-lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, isZh: lang === 'zh' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
