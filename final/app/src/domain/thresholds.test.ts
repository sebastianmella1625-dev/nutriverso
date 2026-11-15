import { describe, expect, it } from 'vitest'
import { classify, parseValue, SOURCES, UNITS, validateReading } from './thresholds'
import { INDICATORS, type CrewProfile } from './types'

const profile: CrewProfile = { crew_id: 'crew-01', name: 'Test', energyGoalKcal: 2800, baselineMassKg: 75 }
const c = (ind: Parameters<typeof classify>[0], v: number) => classify(ind, v, profile)

describe('classify: borders from spec-sebas.md', () => {
  it('bp_systolic (AHA/ACC 2017)', () => {
    expect(c('bp_systolic', 119)).toBe('ok')
    expect(c('bp_systolic', 120)).toBe('watch')
    expect(c('bp_systolic', 129)).toBe('watch')
    expect(c('bp_systolic', 130)).toBe('alert')
    expect(c('bp_systolic', 139)).toBe('alert')
    expect(c('bp_systolic', 140)).toBe('critical')
  })

  it('bp_diastolic has no watch band', () => {
    expect(c('bp_diastolic', 79)).toBe('ok')
    expect(c('bp_diastolic', 80)).toBe('alert')
    expect(c('bp_diastolic', 89)).toBe('alert')
    expect(c('bp_diastolic', 90)).toBe('critical')
  })

  it('heart_rate resting', () => {
    expect(c('heart_rate', 60)).toBe('ok')
    expect(c('heart_rate', 100)).toBe('ok')
    expect(c('heart_rate', 101)).toBe('watch')
    expect(c('heart_rate', 59)).toBe('watch')
    expect(c('heart_rate', 49)).toBe('alert')
    expect(c('heart_rate', 111)).toBe('alert')
    expect(c('heart_rate', 39)).toBe('critical')
    expect(c('heart_rate', 131)).toBe('critical')
  })

  it('glucose fasting (ADA 2026), low values escalate', () => {
    expect(c('glucose', 70)).toBe('ok')
    expect(c('glucose', 99)).toBe('ok')
    expect(c('glucose', 100)).toBe('watch')
    expect(c('glucose', 125)).toBe('watch')
    expect(c('glucose', 126)).toBe('alert')
    expect(c('glucose', 69)).toBe('alert')
    expect(c('glucose', 54)).toBe('alert')
    expect(c('glucose', 53)).toBe('critical')
  })

  it('body_temp, including the 35.0–36.0 gap ruled as watch', () => {
    expect(c('body_temp', 36.1)).toBe('ok')
    expect(c('body_temp', 37.2)).toBe('ok')
    expect(c('body_temp', 37.3)).toBe('watch')
    expect(c('body_temp', 38)).toBe('alert')
    expect(c('body_temp', 39.4)).toBe('alert')
    expect(c('body_temp', 39.5)).toBe('critical')
    expect(c('body_temp', 35.5)).toBe('watch')
    expect(c('body_temp', 34.9)).toBe('critical')
  })

  it('sleep_hours (AASM/SRS ≥7 h)', () => {
    expect(c('sleep_hours', 7)).toBe('ok')
    expect(c('sleep_hours', 6.9)).toBe('watch')
    expect(c('sleep_hours', 6)).toBe('watch')
    expect(c('sleep_hours', 5)).toBe('alert')
    expect(c('sleep_hours', 4.9)).toBe('critical')
  })

  it('mood self-report 1–5', () => {
    expect(c('mood', 5)).toBe('ok')
    expect(c('mood', 4)).toBe('ok')
    expect(c('mood', 3)).toBe('watch')
    expect(c('mood', 2)).toBe('alert')
    expect(c('mood', 1)).toBe('critical')
  })

  it('water_ml', () => {
    expect(c('water_ml', 2000)).toBe('ok')
    expect(c('water_ml', 1999)).toBe('watch')
    expect(c('water_ml', 1500)).toBe('watch')
    expect(c('water_ml', 1499)).toBe('alert')
    expect(c('water_ml', 1000)).toBe('alert')
    expect(c('water_ml', 999)).toBe('critical')
  })

  it('energy_kcal as % of the crew energy goal (2800)', () => {
    expect(c('energy_kcal', 2520)).toBe('ok') // 90 %
    expect(c('energy_kcal', 2519)).toBe('watch')
    expect(c('energy_kcal', 2240)).toBe('watch') // 80 %
    expect(c('energy_kcal', 1960)).toBe('alert') // 70 %
    expect(c('energy_kcal', 1950)).toBe('critical')
  })

  it('protein_g as g/kg of baseline mass (75 kg)', () => {
    expect(c('protein_g', 90)).toBe('ok') // 1.2 g/kg
    expect(c('protein_g', 75)).toBe('watch') // 1.0
    expect(c('protein_g', 60)).toBe('alert') // 0.8
    expect(c('protein_g', 59)).toBe('critical')
  })

  it('body_mass_kg as % loss vs baseline (GLIM: >5 % = malnutrition criterion)', () => {
    expect(c('body_mass_kg', 75)).toBe('ok')
    expect(c('body_mass_kg', 80)).toBe('ok') // weight gain is not a loss
    expect(c('body_mass_kg', 73.5)).toBe('watch') // −2 %
    expect(c('body_mass_kg', 71.25)).toBe('alert') // −5 %
    expect(c('body_mass_kg', 67.5)).toBe('critical') // −10 %
  })
})

describe('parseValue: check-in input', () => {
  it('accepts a decimal comma', () => {
    expect(parseValue('36,8')).toBe(36.8)
  })
  it('accepts a decimal point and surrounding spaces', () => {
    expect(parseValue(' 120.5 ')).toBe(120.5)
  })
  it('rejects text and empty input', () => {
    expect(parseValue('abc')).toBeNull()
    expect(parseValue('')).toBeNull()
    expect(parseValue('12a')).toBeNull()
  })
})

describe('validateReading: implausible values are rejected', () => {
  it('rejects heart_rate 0 and body_temp 368 (typo)', () => {
    expect(validateReading('heart_rate', 0).ok).toBe(false)
    expect(validateReading('body_temp', 368).ok).toBe(false)
  })
  it('accepts a normal temperature', () => {
    expect(validateReading('body_temp', 36.8)).toEqual({ ok: true })
  })
  it('rejects NaN with a not-a-number reason', () => {
    expect(validateReading('glucose', Number.NaN)).toEqual({ ok: false, reason: 'validation.not_a_number' })
  })
  it('returns an i18n reason key for out-of-range', () => {
    expect(validateReading('mood', 6)).toEqual({ ok: false, reason: 'validation.out_of_range' })
  })
  it('accepts the plausible-range edges', () => {
    expect(validateReading('heart_rate', 20).ok).toBe(true)
    expect(validateReading('heart_rate', 250).ok).toBe(true)
    expect(validateReading('heart_rate', 251).ok).toBe(false)
  })
})

describe('metadata', () => {
  it('every indicator has a unit and a source', () => {
    for (const ind of INDICATORS) {
      expect(UNITS[ind]).toBeTruthy()
      expect(SOURCES[ind]).toBeTruthy()
    }
    expect(INDICATORS).toHaveLength(11)
  })
})
