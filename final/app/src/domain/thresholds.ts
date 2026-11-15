import { energyTarget, fluidTarget } from './nasa'
import type { CrewProfile, Indicator, Status } from './types'

// Umbrales clínicos del prototipo. Fuente de verdad: sdd/spec-sebas.md (tabla de umbrales).
// La app orienta, no diagnostica. ⚠ = fuente por verificar antes del prototipo final.

export const UNITS: Record<Indicator, string> = {
  heart_rate: 'bpm',
  bp_systolic: 'mmHg',
  bp_diastolic: 'mmHg',
  glucose: 'mg/dL',
  body_temp: '°C',
  sleep_hours: 'h',
  mood: '1-5',
  water_ml: 'mL',
  energy_kcal: 'kcal',
  protein_g: 'g',
  body_mass_kg: 'kg',
}

export const SOURCES: Record<Indicator, string> = {
  bp_systolic: 'AHA/ACC 2017 Hypertension Guideline',
  bp_diastolic: 'AHA/ACC 2017 Hypertension Guideline',
  heart_rate: 'AHA resting heart rate 60–100 bpm; outer cut-offs set by the team ⚠',
  glucose: 'ADA Standards of Care in Diabetes 2026',
  body_temp: 'Standard clinical fever/hypothermia criteria ⚠',
  sleep_hours: 'AASM/SRS consensus: adults ≥7 h',
  mood: 'Team-defined 1–5 self-report scale (not a clinical instrument)',
  water_ml: 'NASA JSC-67378 fluid target: max(32 mL/kg, 2500 mL men / 2100 mL women); % cut-offs set by the team',
  energy_kcal: 'NASA JSC-67378 (IOM 2005 EER + 200 kcal per EVA hour), 3-day average; % cut-offs set by the team',
  protein_g: 'NASA JSC-67378 (1.2–1.8 g/kg/day)',
  body_mass_kg: 'NASA Food and Nutrition Risk Rev D (2025): 3.3 % and 5 % loss',
}

/** Redondea a 2 decimales para que los bordes exactos (90 %, 1,2 g/kg, −5 %) no caigan por error de coma flotante. */
const r2 = (x: number) => Math.round(x * 100) / 100

/** Escala "más es mejor": devuelve el primer tramo cuyo mínimo se cumple. */
function higherIsBetter(v: number, ok: number, watch: number, alert: number): Status {
  if (v >= ok) return 'ok'
  if (v >= watch) return 'watch'
  if (v >= alert) return 'alert'
  return 'critical'
}

/**
 * Estado de un indicador. `massKg` = masa actual (por defecto, la basal): la usan las metas de agua, energía y proteína.
 * Para `energy_kcal` se pasa el promedio de 3 días (D-50).
 */
export function classify(ind: Indicator, value: number, profile: CrewProfile, massKg = profile.baselineMassKg): Status {
  const v = value
  switch (ind) {
    case 'bp_systolic':
      if (v < 120) return 'ok'
      if (v < 130) return 'watch'
      if (v < 140) return 'alert'
      return 'critical'
    case 'bp_diastolic':
      if (v < 80) return 'ok'
      if (v < 90) return 'alert'
      return 'critical'
    case 'heart_rate':
      if (v < 40 || v > 130) return 'critical'
      if (v < 50 || v > 110) return 'alert'
      if (v < 60 || v > 100) return 'watch'
      return 'ok'
    case 'glucose':
      if (v < 54) return 'critical'
      if (v < 70) return 'alert'
      if (v < 100) return 'ok'
      if (v < 126) return 'watch'
      return 'alert'
    case 'body_temp':
      if (v < 35 || v >= 39.5) return 'critical'
      if (v >= 38) return 'alert'
      if (v > 37.2 || v < 36.1) return 'watch' // incluye el hueco 35,0–36,0 (ruling Task 2)
      return 'ok'
    case 'sleep_hours':
      return higherIsBetter(v, 7, 6, 5)
    case 'mood':
      return higherIsBetter(v, 4, 3, 2)
    case 'water_ml': // D-48
      return higherIsBetter(r2((v / fluidTarget(profile, massKg)) * 100), 100, 80, 60)
    case 'energy_kcal': // D-50
      return higherIsBetter(r2((v / energyTarget(profile, massKg)) * 100), 90, 80, 70)
    case 'protein_g':
      return higherIsBetter(r2(v / massKg), 1.2, 1.0, 0.8)
    case 'body_mass_kg': {
      const lossPct = r2(((profile.baselineMassKg - v) / profile.baselineMassKg) * 100)
      if (lossPct < 2) return 'ok' // D-49
      if (lossPct < 3.3) return 'watch'
      if (lossPct < 5) return 'alert'
      return 'critical'
    }
  }
}

/** Convierte lo que escribe el usuario a número. Acepta coma decimal ("36,8"). */
export function parseValue(raw: string): number | null {
  const s = raw.trim().replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null
  return Number(s)
}

/** Rangos fisiológicamente plausibles: fuera de ellos es casi seguro un error de tipeo. */
const PLAUSIBLE: Record<Indicator, [number, number]> = {
  heart_rate: [20, 250],
  bp_systolic: [50, 260],
  bp_diastolic: [30, 160],
  glucose: [20, 600],
  body_temp: [30, 43],
  sleep_hours: [0, 24],
  mood: [1, 5],
  water_ml: [0, 8000],
  energy_kcal: [0, 8000],
  protein_g: [0, 400],
  body_mass_kg: [30, 200],
}

export function validateReading(
  ind: Indicator,
  value: number,
): { ok: true } | { ok: false; reason: string } {
  if (!Number.isFinite(value)) return { ok: false, reason: 'validation.not_a_number' }
  const [min, max] = PLAUSIBLE[ind]
  if (value < min || value > max) return { ok: false, reason: 'validation.out_of_range' }
  return { ok: true }
}
