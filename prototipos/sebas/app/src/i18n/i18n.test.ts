import { describe, expect, it } from 'vitest'
import { SYSTEM_IDS, SYSTEMS, actionKey } from '../domain/systems'
import { INDICATORS, type Status } from '../domain/types'
import { en } from './en'
import { es } from './es'
import { DICTS, initialLang, translate } from './translate'

const STATUSES: Status[] = ['ok', 'watch', 'alert', 'critical', 'nodata']

describe('dictionaries', () => {
  it('en and es have exactly the same keys', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort())
  })
  it('no empty strings', () => {
    for (const d of [en, es]) for (const [k, v] of Object.entries(d)) expect(v.trim(), k).not.toBe('')
  })
  it('has an action for every system × status (25)', () => {
    for (const s of SYSTEM_IDS) for (const st of STATUSES) expect(en[actionKey(s, st)], `${s}.${st}`).toBeTruthy()
  })
  it('every critical action tells the astronaut to notify Ground', () => {
    for (const s of SYSTEM_IDS) {
      expect(en[actionKey(s, 'critical')]).toMatch(/[Nn]otify Ground/)
      expect(es[actionKey(s, 'critical')]).toMatch(/[Aa]visa a Tierra/)
    }
  })
  it('covers every key the domain emits', () => {
    const domainKeys = [
      ...SYSTEM_IDS.map((s) => `system.${s}`),
      ...SYSTEM_IDS.map((s) => SYSTEMS[s].hazardKey),
      ...INDICATORS.map((i) => `indicator.${i}`),
      ...STATUSES.map((s) => `status.${s}`),
      'status.incomplete',
      'validation.not_a_number',
      'validation.out_of_range',
    ]
    for (const k of domainKeys) expect(en[k], k).toBeTruthy()
  })
})

describe('translate', () => {
  it('returns the text for the language', () => {
    expect(translate('es', 'status.ok')).toBe(es['status.ok'])
  })
  it('interpolates {vars}', () => {
    expect(translate('en', 'crew.inbox.in_transit', { s: 12 })).toContain('12')
  })
  it('falls back to English, then to the key itself', () => {
    const k = 'only.in.test'
    expect(translate('es', 'status.ok')).not.toBe('status.ok')
    expect(translate('en', k)).toBe(k)
  })
  it('exposes both dictionaries', () => {
    expect(Object.keys(DICTS)).toEqual(['en', 'es'])
  })
})

describe('initialLang (D-25)', () => {
  it('defaults to English', () => {
    expect(initialLang(() => null)).toBe('en')
  })
  it('remembers a saved choice', () => {
    expect(initialLang(() => 'es')).toBe('es')
  })
  it('ignores garbage and storage errors', () => {
    expect(initialLang(() => 'fr')).toBe('en')
    expect(
      initialLang(() => {
        throw new Error('blocked')
      }),
    ).toBe('en')
  })
})
