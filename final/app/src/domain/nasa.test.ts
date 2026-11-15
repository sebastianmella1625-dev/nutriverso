import { describe, expect, it } from 'vitest'
import { currentMass, eer, energyAvg3d, energyTarget, fluidTarget } from './nasa'
import type { CrewProfile, Indicator, Reading } from './types'

const man: CrewProfile = {
  crew_id: 'm1', name: 'M', sex: 'm', age: 40, heightM: 1.78, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 75,
}
const woman: CrewProfile = {
  crew_id: 'w1', name: 'W', sex: 'f', age: 31, heightM: 1.65, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 62,
}
const NOW = new Date('2026-11-15T12:00:00Z')
const daysAgo = (d: number, h = 0) => new Date(NOW.getTime() - d * 864e5 - h * 3600e3).toISOString()
let n = 0
const r = (indicator: Indicator, value: number, at: string, crew_id = 'm1'): Reading => ({
  id: `n${n++}`, crew_id, indicator, value, unit: '', measured_at: at, source: 'simulated',
})

describe('EER (IOM 2005 via NASA JSC-67378)', () => {
  it('man 40 y, 75 kg, 1.78 m, high activity = 2972.0 kcal', () => {
    // 662 − 9.53·40 + 1.25·(15.9·75 + 539.6·1.78) = 2972.035
    expect(eer(man, 75)).toBeCloseTo(2972.0, 1)
  })
  it('woman 31 y, 62 kg, 1.65 m, high activity = 2362.6 kcal', () => {
    // 354 − 6.91·31 + 1.25·(9.36·62 + 726·1.65) = 2362.565
    expect(eer(woman, 62)).toBeCloseTo(2362.6, 1)
  })
  it('low activity uses PA 1.11', () => {
    expect(eer({ ...man, activity: 'low' }, 75)).toBeCloseTo(2670.6, 1)
  })
})

describe('energyTarget (+200 kcal per EVA hour, D-51)', () => {
  it('adds 200 kcal per average EVA hour', () => {
    expect(energyTarget({ ...man, evaHoursPerDay: 1.5 }, 75)).toBeCloseTo(2972.0 + 300, 1)
  })
})

describe('fluidTarget = max(32 mL/kg, 2500 men / 2100 women)', () => {
  it('uses the sex floor for light crew', () => {
    expect(fluidTarget(man, 75)).toBe(2500)
    expect(fluidTarget(woman, 62)).toBe(2100)
  })
  it('uses 32 mL/kg above the floor', () => {
    expect(fluidTarget(man, 90)).toBe(2880)
    expect(fluidTarget(woman, 70)).toBe(2240)
  })
})

describe('currentMass', () => {
  it('uses the latest body mass of the last 60 days', () => {
    expect(currentMass([r('body_mass_kg', 74, daysAgo(10)), r('body_mass_kg', 73, daysAgo(3))], man, NOW)).toBe(73)
  })
  it('falls back to the baseline when there is no recent mass', () => {
    expect(currentMass([r('body_mass_kg', 70, daysAgo(61))], man, NOW)).toBe(75)
    expect(currentMass([], man, NOW)).toBe(75)
  })
})

describe('energyAvg3d (D-50)', () => {
  it('averages the latest value of each of the last 3 days', () => {
    const rs = [r('energy_kcal', 3000, daysAgo(0)), r('energy_kcal', 2400, daysAgo(1)), r('energy_kcal', 2700, daysAgo(2)), r('energy_kcal', 100, daysAgo(3))]
    expect(energyAvg3d(rs, 'm1', NOW)).toBe(2700)
  })
  it('uses only the days that have data', () => {
    expect(energyAvg3d([r('energy_kcal', 2000, daysAgo(1))], 'm1', NOW)).toBe(2000)
  })
  it('within a day, the latest reading wins', () => {
    expect(energyAvg3d([r('energy_kcal', 1000, daysAgo(0, 5)), r('energy_kcal', 2000, daysAgo(0, 1))], 'm1', NOW)).toBe(2000)
  })
  it('is null without energy readings in the last 3 days', () => {
    expect(energyAvg3d([r('energy_kcal', 2000, daysAgo(4))], 'm1', NOW)).toBeNull()
  })
})
