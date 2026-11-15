import { en } from './en'
import { es } from './es'

export type Lang = 'en' | 'es'
export const DICTS: Record<Lang, Record<string, string>> = { en, es }
export const LANG_STORAGE_KEY = 'nv.lang'

/** Texto de `key` en `lang`, con {vars} interpoladas. Si falta: inglés y, si tampoco existe, la clave. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const text = DICTS[lang][key] ?? en[key] ?? key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m))
}

/** D-25: inglés por defecto; respeta una elección guardada válida. `read` puede lanzar (storage bloqueado). */
export function initialLang(read: () => string | null): Lang {
  try {
    const saved = read()
    return saved === 'es' || saved === 'en' ? saved : 'en'
  } catch {
    return 'en'
  }
}
