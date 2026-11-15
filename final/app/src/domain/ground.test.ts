import { describe, expect, it } from 'vitest'
import { pendingAlerts, rankCrew, suggestionKey, worstSystem } from './ground'
import { CREW, generateMission } from './mission'
import type { SystemId, SystemState } from './systems'
import type { Indicator, Reading } from './types'

const NOW = new Date('2026-11-14T12:00:00Z')
const iso = (msAgo: number) => new Date(NOW.getTime() - msAgo).toISOString()
const state = (status: SystemState['status']): SystemState => ({ status, complete: true })
const all = (s: SystemState['status']) =>
  ({ mind: state(s), heart: state(s), bone: state(s), muscle: state(s), immune: state(s) }) as Record<SystemId, SystemState>

describe('worstSystem', () => {
  it('returns the most severe system', () => {
    expect(worstSystem({ ...all('ok'), bone: state('alert'), mind: state('watch') })).toBe('bone')
  })
  it('is null when every system is ok or has no data', () => {
    expect(worstSystem(all('ok'))).toBeNull()
    expect(worstSystem(all('nodata'))).toBeNull()
  })
})

describe('rankCrew (D-34)', () => {
  it('puts the most affected crew member first', () => {
    const ranks = rankCrew(generateMission(42, 30, NOW), CREW, NOW)
    expect(ranks.map((r) => r.profile.name)).toEqual(['Miguel', 'Camila'])
    expect(ranks[0].worst).toMatch(/alert|critical/)
    expect(['bone', 'muscle']).toContain(ranks[0].worstSystem)
  })
})

describe('suggestionKey (D-36)', () => {
  it('suggests the action for the worst system', () => {
    expect(suggestionKey({ ...all('ok'), bone: state('alert') })).toBe('action.bone.alert')
  })
  it('suggests nothing when all is ok', () => {
    expect(suggestionKey(all('ok'))).toBeNull()
  })
})

describe('pendingAlerts (D-35)', () => {
  const msg = (crew_id: string, from_role: 'crew' | 'ground', createdMsAgo: number, deliverMsAgo: number | null) => ({
    id: `${crew_id}-${createdMsAgo}`,
    crew_id,
    from_role,
    body: 'Bone is Alert',
    created_at: iso(createdMsAgo),
    deliver_at: deliverMsAgo === null ? null : iso(deliverMsAgo),
  })
  const crit: Reading = {
    id: 'c1', crew_id: 'crew-02', indicator: 'bp_systolic' as Indicator, value: 150, unit: 'mmHg',
    measured_at: iso(60_000), source: 'simulated',
  }

  it('shows a delivered crew notification that Ground has not seen', () => {
    const a = pendingAlerts([msg('crew-01', 'crew', 10_000, 5_000)], [], CREW, {}, NOW)
    expect(a).toEqual([{ crew_id: 'crew-01', kind: 'notify', name: 'Miguel' }])
  })
  it('hides a crew notification still in transit to Earth', () => {
    expect(pendingAlerts([msg('crew-01', 'crew', 10_000, -5_000)], [], CREW, {}, NOW)).toEqual([])
  })
  it('ignores messages sent by Ground', () => {
    expect(pendingAlerts([msg('crew-01', 'ground', 10_000, null)], [], CREW, {}, NOW)).toEqual([])
  })
  it('hides alerts once Ground opened that crew member afterwards', () => {
    expect(pendingAlerts([msg('crew-01', 'crew', 10_000, 5_000)], [], CREW, { 'crew-01': iso(1_000) }, NOW)).toEqual([])
  })
  it('compares times as instants: Supabase "+00:00" timestamps vs JS "Z" (F6)', () => {
    const supa = { id: 's', crew_id: 'crew-01', from_role: 'crew' as const, body: 'x', created_at: '2026-11-14T11:59:40+00:00', deliver_at: '2026-11-14T11:59:50+00:00' }
    expect(pendingAlerts([supa], [], CREW, { 'crew-01': '2026-11-14T11:59:55.000Z' }, NOW)).toEqual([])
    expect(pendingAlerts([supa], [], CREW, { 'crew-01': '2026-11-14T11:59:45.000Z' }, NOW)).toHaveLength(1)
  })

  it('raises a critical alert from readings, until seen after the latest reading', () => {
    expect(pendingAlerts([], [crit], CREW, {}, NOW)).toEqual([
      { crew_id: 'crew-02', kind: 'critical', name: 'Camila', system: 'heart' },
    ])
    expect(pendingAlerts([], [crit], CREW, { 'crew-02': iso(30_000) }, NOW)).toEqual([])
  })
})
