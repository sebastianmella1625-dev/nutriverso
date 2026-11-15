// Clima espacial NASA DONKI (F5; idea de Miguel). Datos vivos de NASA (Space Weather Database Of Notifications,
// Knowledge, Information). Solo orientativo: la fuente oficial de pronósticos es NOAA SWPC.

export const SW_TYPES = ['SEP', 'FLR', 'CME', 'GST', 'RBE'] as const
export type SwType = (typeof SW_TYPES)[number]

export interface SpaceWeather {
  fetchedAt: string // ISO
  counts: Record<SwType, number>
  /** Hubo un evento de partículas solares (SEP) en 7 días → aviso de refugio. */
  sep: boolean
  last: { type: SwType; time: string; url: string | null } | null
}

const SAFE_NASA_URL = /^https:\/\/([a-z0-9-]+\.)*nasa\.gov\//i
const CACHE_MINUTES = 30

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

export function donkiUrl(now: Date, apiKey: string): string {
  const start = new Date(now.getTime() - 7 * 864e5)
  return `https://api.nasa.gov/DONKI/notifications?startDate=${isoDay(start)}&endDate=${isoDay(now)}&type=all&api_key=${encodeURIComponent(apiKey)}`
}

/** Convierte la respuesta de DONKI. Lanza error si no es una lista (límite de consultas, HTML, objeto de error). */
export function parseDonki(json: unknown, fetchedAt: Date): SpaceWeather {
  if (!Array.isArray(json)) throw new Error('DONKI: unexpected payload')
  const relevant = json
    .filter((m): m is { messageType: SwType; messageIssueTime: string; messageURL?: unknown } =>
      !!m && typeof m === 'object' && SW_TYPES.includes((m as { messageType?: SwType }).messageType as SwType),
    )
    .sort((a, b) => String(b.messageIssueTime).localeCompare(String(a.messageIssueTime)))
  const counts = Object.fromEntries(SW_TYPES.map((t) => [t, relevant.filter((m) => m.messageType === t).length])) as Record<SwType, number>
  const top = relevant[0]
  const url = top && typeof top.messageURL === 'string' && SAFE_NASA_URL.test(top.messageURL) ? top.messageURL : null
  return {
    fetchedAt: fetchedAt.toISOString(),
    counts,
    sep: counts.SEP > 0,
    last: top ? { type: top.messageType, time: String(top.messageIssueTime).slice(0, 16).replace('T', ' ') + ' UTC', url } : null,
  }
}

/** Máximo 1 consulta cada 30 min (protege el límite de la clave en la WiFi compartida de la sede). */
export function shouldFetch(cached: SpaceWeather | null, now: Date): boolean {
  if (!cached) return true
  return now.getTime() - new Date(cached.fetchedAt).getTime() >= CACHE_MINUTES * 60e3
}
