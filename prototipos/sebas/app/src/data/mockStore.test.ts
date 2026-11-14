// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockStore } from './mockStore'
import { createStore, roomFromSearch } from './index'
import { fromRemoteCrew, toRemoteCrew } from './supabaseStore'
import { seedSql } from './seedSql'
import { generateMission } from '../domain/mission'

const NOW = new Date('2026-11-14T12:00:00Z')

beforeEach(() => localStorage.clear())

describe('mock store (D-26)', () => {
  it('seeds the 30-day mission on first load', async () => {
    const s = createMockStore(() => NOW)
    expect(await s.readings()).toHaveLength(660)
    expect(s.kind).toBe('mock')
    expect(s.canReset).toBe(true)
  })

  it('keeps added readings with a generated id', async () => {
    const s = createMockStore(() => NOW)
    await s.addReadings([
      { crew_id: 'crew-01', indicator: 'water_ml', value: 500, unit: 'mL', measured_at: NOW.toISOString(), source: 'simulated' },
    ])
    const all = await s.readings()
    expect(all).toHaveLength(661)
    expect(all.at(-1)?.id).toBeTruthy()
  })

  it('persists across store instances (same browser)', async () => {
    const a = createMockStore(() => NOW)
    await a.sendMessage({ crew_id: 'crew-01', from_role: 'ground', body: 'hi', deliver_at: null })
    const b = createMockStore(() => NOW)
    expect((await b.messages()).map((m) => m.body)).toEqual(['hi'])
  })

  it('notifies subscribers after sendMessage', async () => {
    const s = createMockStore(() => NOW)
    const cb = vi.fn()
    const off = s.subscribe(cb)
    await s.sendMessage({ crew_id: 'crew-01', from_role: 'ground', body: 'drink water', deliver_at: null })
    expect(cb).toHaveBeenCalled()
    off()
  })

  it('reset restores the mission and clears messages (D-29)', async () => {
    const s = createMockStore(() => NOW)
    await s.sendMessage({ crew_id: 'crew-01', from_role: 'ground', body: 'x', deliver_at: null })
    await s.addReadings([
      { crew_id: 'crew-01', indicator: 'mood', value: 1, unit: '1-5', measured_at: NOW.toISOString(), source: 'simulated' },
    ])
    await s.reset()
    expect(await s.readings()).toHaveLength(660)
    expect(await s.messages()).toEqual([])
  })

  it('reseeds when stored data is corrupted', async () => {
    localStorage.setItem('nv.readings', '{not json')
    const s = createMockStore(() => NOW)
    expect(await s.readings()).toHaveLength(660)
  })
})

describe('createStore (Review Focus #5)', () => {
  it('without env falls back to mock', () => {
    expect(createStore({}, 'demo').kind).toBe('mock')
  })
  it('with an invalid URL falls back to mock', () => {
    expect(createStore({ VITE_SUPABASE_URL: 'nope', VITE_SUPABASE_ANON_KEY: 'x' }, 'demo').kind).toBe('mock')
  })
  it('without a room stays local even with valid env (D-28)', () => {
    expect(createStore({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' }, null).kind).toBe('mock')
  })
  it('with a room and valid env uses supabase', () => {
    const s = createStore({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' }, 'demo')
    expect(s.kind).toBe('supabase')
    expect(s.room).toBe('demo')
    expect(s.canReset).toBe(false)
  })
})

describe('room (D-28)', () => {
  it('reads a safe room name from the query string', () => {
    expect(roomFromSearch('?room=demo-1')).toBe('demo-1')
    expect(roomFromSearch('?room=DemoNASA')).toBe('demonasa')
  })
  it('rejects missing or unsafe names', () => {
    expect(roomFromSearch('')).toBeNull()
    expect(roomFromSearch('?room=a')).toBeNull()
    expect(roomFromSearch("?room=x';drop")).toBeNull()
  })
  it('prefixes crew ids per room and strips them back', () => {
    expect(toRemoteCrew('demo', 'crew-01')).toBe('demo:crew-01')
    expect(fromRemoteCrew('demo', 'demo:crew-01')).toBe('crew-01')
  })
})

describe('seedSql (D-27)', () => {
  const sql = seedSql('demo', generateMission(42, 30, NOW), NOW)
  it('wipes only that room first', () => {
    expect(sql).toContain("delete from readings where crew_id like 'demo:%'")
    expect(sql).toContain("delete from messages where crew_id like 'demo:%'")
  })
  it('inserts all 660 readings with times relative to now()', () => {
    expect(sql.match(/now\(\) - interval/g)).toHaveLength(660)
    expect(sql).toContain("'demo:crew-01'")
  })
  it('rejects an unsafe room name', () => {
    expect(() => seedSql("x';--", [], NOW)).toThrow()
  })
})
