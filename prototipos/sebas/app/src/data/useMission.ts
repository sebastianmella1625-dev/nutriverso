import { useCallback, useEffect, useState } from 'react'
import type { Reading } from '../domain/types'
import { createStore, roomFromSearch, type Message, type Store } from './index'

/** Una sola capa de datos por pestaña: sala de la URL + claves de .env.local (D-26, D-28). */
export const store: Store = createStore(
  {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  },
  roomFromSearch(window.location.search),
)

/** Lecturas y mensajes en vivo: recarga cada vez que el store avisa un cambio. */
export function useMission() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    try {
      const [r, m] = await Promise.all([store.readings(), store.messages()])
      setReadings(r)
      setMessages(m)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void reload()
    return store.subscribe(() => void reload())
  }, [reload])

  return { store, readings, messages, error, loaded, reload }
}
