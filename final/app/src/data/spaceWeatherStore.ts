import { donkiUrl, parseDonki, shouldFetch, type SpaceWeather } from '../domain/spaceWeather'

// Carga del clima espacial con caché (F5). Nunca lanza: la demo en vivo no debe mostrar un error en blanco.
// live = dato vigente (recién consultado o caché de menos de 30 min); cached = dato guardado más antiguo porque NASA no respondió.

export const SW_CACHE_KEY = 'nv.spaceWeather'

export interface SwState {
  data: SpaceWeather | null
  status: 'live' | 'cached' | 'unavailable'
}

interface Opts {
  now: Date
  apiKey: string
  fetchFn: typeof fetch
  storage: Pick<Storage, 'getItem' | 'setItem'>
}

function readCache(storage: Opts['storage']): SpaceWeather | null {
  try {
    const raw = storage.getItem(SW_CACHE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as SpaceWeather
    return v && typeof v.fetchedAt === 'string' && v.counts ? v : null
  } catch {
    return null
  }
}

export async function loadSpaceWeather({ now, apiKey, fetchFn, storage }: Opts): Promise<SwState> {
  const cached = readCache(storage)
  if (cached && !shouldFetch(cached, now)) return { data: cached, status: 'live' }
  try {
    const res = await fetchFn(donkiUrl(now, apiKey), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`DONKI HTTP ${res.status}`)
    const data = parseDonki(await res.json(), now)
    try {
      storage.setItem(SW_CACHE_KEY, JSON.stringify(data))
    } catch {
      /* storage lleno o bloqueado: igual se muestra */
    }
    return { data, status: 'live' }
  } catch {
    return cached ? { data: cached, status: 'cached' } : { data: null, status: 'unavailable' }
  }
}
