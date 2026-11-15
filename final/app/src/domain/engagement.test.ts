import { describe, expect, it } from 'vitest'
import { badges, checkinIndicators, needsBodyMass, streak } from './engagement'
import { CREW, generateMission } from './mission'
import type { Indicator, Reading } from './types'

const NOW = new Date('2026-11-14T12:00:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 3600_000).toISOString()
let n = 0
const r = (indicator: Indicator, value: number, dAgo: number, crew_id = 'crew-01'): Reading => ({
  id: `e${n++}`, crew_id, indicator, value, unit: '', measured_at: daysAgo(dAgo), source: 'simulated',
})

describe('streak (D-33)', () => {
  it('counts consecutive days with at least one reading, ending today', () => {
    expect(streak([r('mood', 4, 0), r('mood', 4, 1), r('mood', 4, 2)], 'crew-01', NOW)).toBe(3)
  })
  it('a missing day breaks the streak', () => {
    expect(streak([r('mood', 4, 0), r('mood', 4, 2)], 'crew-01', NOW)).toBe(1)
  })
  it('a streak can end yesterday (today not logged yet)', () => {
    expect(streak([r('mood', 4, 1), r('mood', 4, 2)], 'crew-01', NOW)).toBe(2)
  })
  it('is 0 with no readings or only other crew', () => {
    expect(streak([], 'crew-01', NOW)).toBe(0)
    expect(streak([r('mood', 4, 0, 'crew-02')], 'crew-01', NOW)).toBe(0)
  })
  it('the 30-day simulated mission gives a 30-day streak', () => {
    expect(streak(generateMission(42, 30, NOW), 'crew-01', NOW)).toBe(30)
  })
})

describe('badges (D-33)', () => {
  it('first week needs a 7-day streak', () => {
    const six = [0, 1, 2, 3, 4, 5].map((d) => r('mood', 4, d))
    expect(badges(six, CREW[0], NOW).first_week).toBe(false)
    expect(badges([...six, r('mood', 4, 6)], CREW[0], NOW).first_week).toBe(true)
  })
  it('hydration needs the NASA fluid target (2500 mL for Miguel) on each of the last 5 days', () => {
    const ok5 = [0, 1, 2, 3, 4].map((d) => r('water_ml', 2500, d))
    expect(badges(ok5, CREW[0], NOW).hydration_5).toBe(true)
    expect(badges([...ok5.slice(1), r('water_ml', 2400, 0)], CREW[0], NOW).hydration_5).toBe(false)
  })
  it('sleep needs ≥7 h on each of the last 5 days', () => {
    const ok5 = [0, 1, 2, 3, 4].map((d) => r('sleep_hours', 7.2, d))
    expect(badges(ok5, CREW[0], NOW).sleep_5).toBe(true)
    expect(badges(ok5.slice(0, 4), CREW[0], NOW).sleep_5).toBe(false)
  })
  it('the demo story: Miguel misses hydration, Camila misses sleep', () => {
    const data = generateMission(42, 30, NOW)
    expect(badges(data, CREW[0], NOW)).toMatchObject({ first_week: true, hydration_5: false, sleep_5: true })
    expect(badges(data, CREW[1], NOW)).toMatchObject({ first_week: true, hydration_5: true, sleep_5: false })
  })
})

describe('weekly body mass (D-32)', () => {
  it('needs body mass when there is none', () => {
    expect(needsBodyMass([], 'crew-01', NOW)).toBe(true)
  })
  it('needs body mass when the last one is 7 days old or more', () => {
    expect(needsBodyMass([r('body_mass_kg', 75, 7)], 'crew-01', NOW)).toBe(true)
    expect(needsBodyMass([r('body_mass_kg', 75, 6)], 'crew-01', NOW)).toBe(false)
  })
  it('check-in lists 10 daily indicators, plus body mass only when needed', () => {
    expect(checkinIndicators([r('body_mass_kg', 75, 1)], 'crew-01', NOW)).toHaveLength(10)
    expect(checkinIndicators([], 'crew-01', NOW)).toHaveLength(11)
    expect(checkinIndicators([], 'crew-01', NOW).at(-1)).toBe('body_mass_kg')
  })
})
