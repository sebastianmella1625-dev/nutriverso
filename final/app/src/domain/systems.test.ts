import { describe, expect, it } from 'vitest'
import {
  actionKey,
  evalContext,
  indicatorStatus,
  compareSeverity,
  crewSeverity,
  freshLatest,
  SYSTEM_IDS,
  SYSTEMS,
  systemStatus,
} from './systems'
import { INDICATORS, type CrewProfile, type Indicator, type Reading } from './types'

const profile: CrewProfile = {
  crew_id: 'crew-01', name: 'Test', sex: 'm', age: 40, heightM: 1.78, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 75,
}
const NOW = new Date('2026-11-14T12:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString()

let n = 0
const r = (indicator: Indicator, value: number, hAgo = 1, crew_id = 'crew-01'): Reading => ({
  id: `r${n++}`,
  crew_id,
  indicator,
  value,
  unit: '',
  measured_at: hoursAgo(hAgo),
  source: 'simulated',
})

describe('SYSTEMS map (D-15)', () => {
  it('covers each of the 11 indicators exactly once', () => {
    const all = SYSTEM_IDS.flatMap((s) => SYSTEMS[s].indicators)
    expect([...all].sort()).toEqual([...INDICATORS].sort())
  })
  it('puts hydration and energy in bone', () => {
    expect(SYSTEMS.bone.indicators).toEqual(['water_ml', 'energy_kcal'])
  })
})

describe('freshLatest (D-18 freshness)', () => {
  it('keeps the most recent reading per indicator', () => {
    const latest = freshLatest([r('heart_rate', 70, 5), r('heart_rate', 90, 2)], 'crew-01', NOW)
    expect(latest.heart_rate?.value).toBe(90)
  })
  it('ignores other crew members', () => {
    const latest = freshLatest([r('heart_rate', 70, 1, 'crew-02')], 'crew-01', NOW)
    expect(latest.heart_rate).toBeUndefined()
  })
  it('drops a daily indicator older than 36 h', () => {
    expect(freshLatest([r('heart_rate', 70, 37)], 'crew-01', NOW).heart_rate).toBeUndefined()
    expect(freshLatest([r('heart_rate', 70, 35)], 'crew-01', NOW).heart_rate).toBeDefined()
  })
  it('keeps body mass up to 8 days', () => {
    expect(freshLatest([r('body_mass_kg', 75, 7 * 24)], 'crew-01', NOW).body_mass_kg).toBeDefined()
    expect(freshLatest([r('body_mass_kg', 75, 9 * 24)], 'crew-01', NOW).body_mass_kg).toBeUndefined()
  })
})

describe('systemStatus (D-16 worst wins, D-17 partial)', () => {
  it('test_system_without_readings_is_nodata', () => {
    expect(systemStatus('heart', {}, profile)).toEqual({ status: 'nodata', complete: false })
  })
  it('one ok + one alert = alert, complete', () => {
    const latest = freshLatest([r('mood', 5), r('sleep_hours', 5.5)], 'crew-01', NOW)
    expect(systemStatus('mind', latest, profile)).toEqual({ status: 'alert', complete: true })
  })
  it('partial data shows the worst measured value, flagged incomplete', () => {
    const latest = freshLatest([r('heart_rate', 120)], 'crew-01', NOW) // 120 bpm = alert; BP missing
    expect(systemStatus('heart', latest, profile)).toEqual({ status: 'alert', complete: false })
  })
  it('a stale reading counts as missing', () => {
    const latest = freshLatest([r('body_temp', 39.6, 40), r('glucose', 85)], 'crew-01', NOW)
    expect(systemStatus('immune', latest, profile)).toEqual({ status: 'ok', complete: false })
  })
})

describe('crewSeverity and ranking', () => {
  it('reports worst status across systems', () => {
    const readings = [r('mood', 5), r('sleep_hours', 8), r('water_ml', 900)]
    const sev = crewSeverity(readings, profile, NOW)
    expect(sev.bySystem.bone.status).toBe('critical')
    expect(sev.bySystem.mind.status).toBe('ok')
    expect(sev.bySystem.heart.status).toBe('nodata')
    expect(sev.worst).toBe('critical')
  })
  it('worst is nodata only when nothing was measured', () => {
    expect(crewSeverity([], profile, NOW).worst).toBe('nodata')
  })
  it('ranks critical > alert > watch > nodata > ok', () => {
    const order = (['ok', 'nodata', 'alert', 'critical', 'watch'] as const).slice().sort(compareSeverity)
    expect(order).toEqual(['critical', 'alert', 'watch', 'nodata', 'ok'])
  })
})

describe('actionKey', () => {
  it('builds the i18n key', () => {
    expect(actionKey('bone', 'critical')).toBe('action.bone.critical')
  })
})

describe('NASA context (D-50, F2)', () => {
  it('energy uses the 3-day average, not only today', () => {
    // hoy 1500 (50 %), ayer y anteayer 3200: promedio 2633 → 88,6 % de 2972 → watch
    const rs = [r('energy_kcal', 1500, 1), r('energy_kcal', 3200, 25), r('energy_kcal', 3200, 49)]
    const ctx = evalContext(rs, profile, NOW)
    expect(ctx.energyAvg).toBe(2633)
    expect(indicatorStatus('energy_kcal', freshLatest(rs, 'crew-01', NOW), profile, ctx)).toBe('watch')
  })
  it('protein uses the current mass, not the baseline', () => {
    const rs = [r('body_mass_kg', 70, 2), r('protein_g', 85, 1)] // 85/70 = 1,21 g/kg → ok (con la basal de 75 kg sería 1,13 → watch)
    const ctx = evalContext(rs, profile, NOW)
    expect(ctx.massKg).toBe(70)
    expect(indicatorStatus('protein_g', freshLatest(rs, 'crew-01', NOW), profile, ctx)).toBe('ok')
  })
  it('energy without readings in 3 days is nodata', () => {
    const ctx = evalContext([], profile, NOW)
    expect(indicatorStatus('energy_kcal', {}, profile, ctx)).toBe('nodata')
  })
})
