'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'

type ThemeContextType = {
  theme: Theme
  setTheme: (t: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  isDark: true,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('heycron-theme') as Theme
    const resolved: Theme = saved === 'light' ? 'light' : 'dark'
    setThemeState(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.classList.toggle('light', resolved === 'light')
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('heycron-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
    document.documentElement.classList.toggle('light', t === 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
