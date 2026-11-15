import { describe, expect, it } from 'vitest'
import { donkiUrl, parseDonki, shouldFetch } from './spaceWeather'

const NOW = new Date('2026-11-15T12:00:00Z')
const msg = (messageType: string, messageIssueTime: string, messageURL = 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/1/1') => ({
  messageType, messageIssueTime, messageURL, messageID: `${messageType}-${messageIssueTime}`, messageBody: '...',
})

describe('parseDonki (F5)', () => {
  it('counts the relevant event types and finds the latest', () => {
    const sw = parseDonki([msg('CME', '2026-11-13T10:00Z'), msg('RBE', '2026-11-15T01:21Z'), msg('CME', '2026-11-14T08:00Z'), msg('Report', '2026-11-15T05:00Z')], NOW)
    expect(sw.counts).toEqual({ SEP: 0, FLR: 0, CME: 2, GST: 0, RBE: 1 })
    expect(sw.last).toEqual({ type: 'RBE', time: '2026-11-15 01:21 UTC', url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/1/1' })
    expect(sw.sep).toBe(false)
    expect(sw.fetchedAt).toBe(NOW.toISOString())
  })
  it('flags a solar energetic particle (SEP) event', () => {
    expect(parseDonki([msg('SEP', '2026-11-14T00:00Z')], NOW).sep).toBe(true)
  })
  it('drops links that are not https on a nasa.gov domain', () => {
    const sw = parseDonki([msg('FLR', '2026-11-14T00:00Z', 'javascript:alert(1)')], NOW)
    expect(sw.last?.url).toBeNull()
    expect(parseDonki([msg('FLR', '2026-11-14T00:00Z', 'https://evil.com/nasa.gov/x')], NOW).last?.url).toBeNull()
  })
  it('an empty list means a calm week', () => {
    const sw = parseDonki([], NOW)
    expect(sw.last).toBeNull()
    expect(Object.values(sw.counts).every((c) => c === 0)).toBe(true)
  })
  it('throws on an invalid payload (rate-limit HTML, error object)', () => {
    expect(() => parseDonki({ error: { code: 'OVER_RATE_LIMIT' } }, NOW)).toThrow()
    expect(() => parseDonki('<html>', NOW)).toThrow()
  })
})

describe('shouldFetch (cache: max 1 call per 30 min)', () => {
  const cached = parseDonki([], new Date(NOW.getTime() - 10 * 60e3))
  it('fetches when nothing is cached', () => {
    expect(shouldFetch(null, NOW)).toBe(true)
  })
  it('does not fetch again within 30 minutes', () => {
    expect(shouldFetch(cached, NOW)).toBe(false)
  })
  it('fetches again after 30 minutes', () => {
    expect(shouldFetch(cached, new Date(NOW.getTime() + 21 * 60e3))).toBe(true)
  })
})

describe('donkiUrl', () => {
  it('asks for the last 7 days with the given key', () => {
    expect(donkiUrl(NOW, 'KEY123')).toBe('https://api.nasa.gov/DONKI/notifications?startDate=2026-11-08&endDate=2026-11-15&type=all&api_key=KEY123')
  })
})
