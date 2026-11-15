import { describe, expect, it, vi } from 'vitest'
import { parseDonki } from '../domain/spaceWeather'
import { loadSpaceWeather, SW_CACHE_KEY } from './spaceWeatherStore'

const NOW = new Date('2026-11-15T12:00:00Z')
const memStorage = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init))
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }
}
const okFetch = (body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))

describe('loadSpaceWeather (F5, Review Focus #1 and #2)', () => {
  it('fetches, parses and caches when there is no cache', async () => {
    const st = memStorage()
    const f = okFetch([{ messageType: 'CME', messageIssueTime: '2026-11-14T08:00Z', messageURL: 'https://kauai.ccmc.gsfc.nasa.gov/x' }])
    const res = await loadSpaceWeather({ now: NOW, apiKey: 'K', fetchFn: f, storage: st })
    expect(res.status).toBe('live')
    expect(res.data?.counts.CME).toBe(1)
    expect(st.m.has(SW_CACHE_KEY)).toBe(true)
    expect(f).toHaveBeenCalledOnce()
  })

  it('uses a fresh cache without calling NASA', async () => {
    const fresh = parseDonki([], new Date(NOW.getTime() - 5 * 60e3))
    const f = okFetch([])
    const res = await loadSpaceWeather({ now: NOW, apiKey: 'K', fetchFn: f, storage: memStorage({ [SW_CACHE_KEY]: JSON.stringify(fresh) }) })
    expect(res.status).toBe('live')
    expect(f).not.toHaveBeenCalled()
  })

  it('rate limit (429) with an old cache shows the saved data', async () => {
    const old = parseDonki([], new Date(NOW.getTime() - 3 * 3600e3))
    const f = vi.fn(async () => new Response('Too many', { status: 429 }))
    const res = await loadSpaceWeather({ now: NOW, apiKey: 'K', fetchFn: f, storage: memStorage({ [SW_CACHE_KEY]: JSON.stringify(old) }) })
    expect(res.status).toBe('cached')
    expect(res.data?.fetchedAt).toBe(old.fetchedAt)
  })

  it('no network and no cache: unavailable, no throw', async () => {
    const f = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    const res = await loadSpaceWeather({ now: NOW, apiKey: 'K', fetchFn: f, storage: memStorage() })
    expect(res).toEqual({ data: null, status: 'unavailable' })
  })

  it('a corrupted cache is ignored and NASA is called', async () => {
    const f = okFetch([])
    const res = await loadSpaceWeather({ now: NOW, apiKey: 'K', fetchFn: f, storage: memStorage({ [SW_CACHE_KEY]: '{oops' }) })
    expect(res.status).toBe('live')
    expect(f).toHaveBeenCalledOnce()
  })
})
