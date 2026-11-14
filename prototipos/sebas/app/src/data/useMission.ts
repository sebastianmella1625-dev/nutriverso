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
    const unsubscribe = store.subscribe(() => void reload())
    // Una PWA en segundo plano (iOS/Android) o una pestaña oculta puede perder avisos en vivo:
    // al volver a primer plano, o al recuperar la conexión, se recargan los datos.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload()
    }
    const onAny = () => void reload()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onAny)
    window.addEventListener('online', onAny)
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onAny)
      window.removeEventListener('online', onAny)
    }
  }, [reload])

  return { store, readings, messages, error, loaded, reload }
}
