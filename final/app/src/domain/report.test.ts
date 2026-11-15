import { describe, expect, it } from 'vitest'
import { CREW, generateMission } from './mission'
import { buildReport } from './report'
import type { CrewProfile, Indicator, Reading } from './types'

const NOW = new Date('2026-11-15T12:00:00Z')
const p: CrewProfile = { crew_id: 'c1', name: 'Test', sex: 'm', age: 40, heightM: 1.78, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 75 }
let n = 0
const r = (indicator: Indicator, value: number, daysAgo: number, crew_id = 'c1'): Reading => ({
  id: `r${n++}`, crew_id, indicator, value, unit: '', measured_at: new Date(NOW.getTime() - daysAgo * 864e5 - 3600e3).toISOString(), source: 'simulated',
})

describe('buildReport (F4: 7 days, always English, D-53..D-55)', () => {
  it('has a header with crew, mission, period and days logged', () => {
    const txt = buildReport([r('mood', 4, 0), r('mood', 4, 2)], p, NOW)
    expect(txt).toContain('NUTRIVERSO · WEEKLY HEALTH REPORT')
    expect(txt).toContain('Crew: Test (c1)')
    expect(txt).toContain('Period: 2026-11-09 → 2026-11-15')
    expect(txt).toContain('Days logged: 2/7')
  })

  it('averages the last 7 days and compares with the NASA target', () => {
    const txt = buildReport([r('water_ml', 2000, 0), r('water_ml', 3000, 1), r('water_ml', 100, 9)], p, NOW)
    expect(txt).toContain('Water intake: 2500 mL avg (NASA target ≥ 2500 mL, 100 %)') // el día 9 queda fuera
  })

  it('lists "NOTIFY NOW" only when a current status needs it', () => {
    expect(buildReport([r('bp_systolic', 165, 0)], p, NOW)).toMatch(/⚠ NOTIFY NOW: Systolic blood pressure 165 mmHg/)
    expect(buildReport([r('bp_systolic', 115, 0)], p, NOW)).not.toContain('NOTIFY NOW')
  })

  it('lists weekly-report items (slow problems)', () => {
    const txt = buildReport([r('body_mass_kg', 72.3, 0)], p, NOW)
    expect(txt).toMatch(/WEEKLY REPORT ITEMS: .*Body mass 72\.3 kg \(−3\.6 % vs baseline\)/)
  })

  it('counts days in alert or worse', () => {
    const txt = buildReport([r('water_ml', 1400, 0), r('water_ml', 1400, 1), r('water_ml', 2600, 2)], p, NOW)
    expect(txt).toContain('Water intake: 2/3 days')
  })

  it('mood reads as x/5, without repeating the scale', () => {
    const txt = buildReport([r('mood', 4, 0), r('mood', 5, 1)], p, NOW)
    expect(txt).toContain('- Mood (1–5): 4.5/5 avg')
    expect(txt).not.toContain('1-5 avg')
  })

  it('works without readings: no NaN, says so', () => {
    const txt = buildReport([], p, NOW)
    expect(txt).toContain('No readings in the last 7 days')
    expect(txt).not.toMatch(/NaN|undefined|Infinity/)
  })

  it('Miguel\'s simulated week reports body mass, water and protein', () => {
    const txt = buildReport(generateMission(42, 30, NOW), CREW[0], NOW)
    expect(txt).toContain('Crew: Miguel (crew-01)')
    expect(txt).toContain('Days logged: 7/7')
    expect(txt).toMatch(/WEEKLY REPORT ITEMS: .*Body mass/)
    expect(txt).not.toMatch(/NaN|undefined/)
  })
})
