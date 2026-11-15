import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialLang, LANG_STORAGE_KEY, translate, type Lang } from './translate'

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => initialLang(() => localStorage.getItem(LANG_STORAGE_KEY)))

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l)
    } catch {
      /* storage bloqueado: el idioma vale solo en esta sesión */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18n>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used inside <I18nProvider>')
  return ctx
}
