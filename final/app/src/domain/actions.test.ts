import { describe, expect, it } from 'vitest'
import { actionLevel, EVIDENCE, mostUrgent, systemActionLevel } from './actions'
import { evalContext, freshLatest } from './systems'
import { INDICATORS, type CrewProfile, type Indicator, type Reading } from './types'

describe('actionLevel: tabla D-52 (híbrido seguro)', () => {
  const vitals: Indicator[] = ['heart_rate', 'bp_systolic', 'bp_diastolic', 'body_temp', 'glucose']
  it('vital signs and glucose: only critical is "now"; watch/alert are self-care', () => {
    for (const v of vitals) {
      expect(actionLevel(v, 'watch'), v).toBe('self')
      expect(actionLevel(v, 'alert'), v).toBe('self')
      expect(actionLevel(v, 'critical'), v).toBe('now')
    }
  })
  it('mood: watch self, alert report, critical now', () => {
    expect(actionLevel('mood', 'watch')).toBe('self')
    expect(actionLevel('mood', 'alert')).toBe('report')
    expect(actionLevel('mood', 'critical')).toBe('now')
  })
  it('sleep, mass, protein, energy: watch self, alert and critical go in the weekly report', () => {
    for (const v of ['sleep_hours', 'body_mass_kg', 'protein_g', 'energy_kcal'] as Indicator[]) {
      expect(actionLevel(v, 'watch'), v).toBe('self')
      expect(actionLevel(v, 'alert'), v).toBe('report')
      expect(actionLevel(v, 'critical'), v).toBe('report')
    }
  })
  it('water is always self-care (critical text adds "if no improvement in 24 h, notify")', () => {
    expect(actionLevel('water_ml', 'watch')).toBe('self')
    expect(actionLevel('water_ml', 'alert')).toBe('self')
    expect(actionLevel('water_ml', 'critical')).toBe('self')
  })
  it('ok and nodata need no action', () => {
    expect(actionLevel('bp_systolic', 'ok')).toBeNull()
    expect(actionLevel('bp_systolic', 'nodata')).toBeNull()
  })
})

describe('mostUrgent / systemActionLevel', () => {
  it('now beats report beats self', () => {
    expect(mostUrgent(['self', 'report', null])).toBe('report')
    expect(mostUrgent(['self', 'now', 'report'])).toBe('now')
    expect(mostUrgent([null, null])).toBeNull()
  })
  it('a system takes its most urgent indicator', () => {
    const p: CrewProfile = { crew_id: 'c', name: 'C', sex: 'm', age: 40, heightM: 1.78, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 75 }
    const now = new Date('2026-11-15T12:00:00Z')
    const rd = (indicator: Indicator, value: number): Reading => ({
      id: indicator, crew_id: 'c', indicator, value, unit: '', measured_at: new Date(now.getTime() - 3600e3).toISOString(), source: 'simulated',
    })
    const rs = [rd('mood', 1), rd('sleep_hours', 5.5)] // ánimo 1 = crítico → now; sueño 5,5 = alerta → report
    expect(systemActionLevel('mind', freshLatest(rs, 'c', now), p, evalContext(rs, p, now))).toBe('now')
  })
})

describe('EVIDENCE', () => {
  it('every indicator has an evidence level', () => {
    for (const i of INDICATORS) expect(['strong', 'moderate', 'weak', 'team']).toContain(EVIDENCE[i])
  })
  it('mood is team-defined (not a clinical scale)', () => {
    expect(EVIDENCE.mood).toBe('team')
  })
})
