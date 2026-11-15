import { createMockStore } from './mockStore'
import type { Store } from './store'
import { createSupabaseStore } from './supabaseStore'

export { roomFromSearch } from './room'
export type { Message, NewMessage, NewReading, Store } from './store'

interface Env {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

/**
 * Elige la capa de datos (D-26, D-28): Supabase solo si hay sala Y claves válidas;
 * cualquier otra cosa (sin sala, sin claves, URL inválida, error al crear) → modo local.
 */
export function createStore(env: Env, room: string | null): Store {
  const url = env.VITE_SUPABASE_URL?.trim()
  const key = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (room && url?.startsWith('https://') && key) {
    try {
      return createSupabaseStore(url, key, room)
    } catch {
      /* cae al modo local */
    }
  }
  return createMockStore()
}
