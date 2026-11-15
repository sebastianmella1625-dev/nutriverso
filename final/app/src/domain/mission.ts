import { UNITS } from './thresholds'
import { INDICATORS, type CrewProfile, type Indicator, type Reading } from './types'

// Misión simulada de 30 días (D-21). Datos 100 % ficticios. Los nombres son del equipo NutriVerso (D-22).

export const CREW: CrewProfile[] = [
  // Perfiles ficticios. Miguel: EER ≈ 3029 kcal + 100 kcal de EVA (0,5 h/día); agua ≥ 2500 mL. Camila: EER ≈ 2363 kcal; agua ≥ 2100 mL.
  { crew_id: 'crew-01', name: 'Miguel', sex: 'm', age: 34, heightM: 1.78, activity: 'high', evaHoursPerDay: 0.5, baselineMassKg: 75 },
  { crew_id: 'crew-02', name: 'Camila', sex: 'f', age: 31, heightM: 1.65, activity: 'high', evaHoursPerDay: 0, baselineMassKg: 62 },
]

/** PRNG determinista con semilla (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Curve = { from: number; to: number; noise: number; decimals: number }

/** Trayectoria de cada indicador: valor del día 1 → valor del último día, ± ruido. */
const STORY: Record<string, Record<Indicator, Curve>> = {
  // Miguel: se deshidrata, come algo menos y pierde masa → hueso y músculo en alerta (contra metas NASA, F2).
  'crew-01': {
    heart_rate: { from: 66, to: 70, noise: 3, decimals: 0 },
    bp_systolic: { from: 112, to: 114, noise: 3, decimals: 0 },
    bp_diastolic: { from: 72, to: 74, noise: 2, decimals: 0 },
    glucose: { from: 86, to: 88, noise: 5, decimals: 0 },
    body_temp: { from: 36.6, to: 36.7, noise: 0.15, decimals: 1 },
    sleep_hours: { from: 7.6, to: 7.3, noise: 0.25, decimals: 1 },
    mood: { from: 4.6, to: 4.2, noise: 0.3, decimals: 0 },
    water_ml: { from: 2700, to: 1700, noise: 60, decimals: -1 }, // 108 % → ~68 % de la meta NASA (alerta)
    energy_kcal: { from: 3150, to: 2520, noise: 40, decimals: -1 }, // ~100 % → ~83 % del requerimiento (vigilar)
    protein_g: { from: 98, to: 80, noise: 2, decimals: 0 }, // 1,31 → 1,11 g/kg (vigilar)
    body_mass_kg: { from: 75, to: 72.2, noise: 0.15, decimals: 1 }, // −3,7 % (alerta, NASA 3,3 %)
  },
  // Camila: estable, pero duerme cada vez menos (≈6,3 h al final) → mente en vigilar (D-21).
  'crew-02': {
    heart_rate: { from: 64, to: 66, noise: 2, decimals: 0 },
    bp_systolic: { from: 108, to: 110, noise: 3, decimals: 0 },
    bp_diastolic: { from: 70, to: 71, noise: 2, decimals: 0 },
    glucose: { from: 84, to: 86, noise: 5, decimals: 0 },
    body_temp: { from: 36.6, to: 36.7, noise: 0.15, decimals: 1 },
    sleep_hours: { from: 7.6, to: 6.3, noise: 0.15, decimals: 1 },
    mood: { from: 4.5, to: 3.4, noise: 0.3, decimals: 0 },
    water_ml: { from: 2300, to: 2200, noise: 80, decimals: -1 },
    energy_kcal: { from: 2250, to: 2200, noise: 40, decimals: -1 },
    protein_g: { from: 84, to: 82, noise: 2, decimals: 0 },
    body_mass_kg: { from: 62, to: 61.8, noise: 0.15, decimals: 1 },
  },
}

const round = (x: number, decimals: number) => {
  const f = 10 ** decimals
  return Math.round(x * f) / f
}

/**
 * Genera la misión simulada. El último día queda 1 h antes de `end` (siempre vigente).
 * Determinista para la misma semilla y la misma fecha final.
 */
export function generateMission(seed: number, days = 30, end = new Date()): Reading[] {
  const rng = mulberry32(seed)
  const out: Reading[] = []
  const lastAt = end.getTime() - 3600_000
  for (let d = 0; d < days; d++) {
    const at = new Date(lastAt - (days - 1 - d) * 24 * 3600_000).toISOString()
    const progress = days === 1 ? 1 : d / (days - 1)
    for (const crew of CREW) {
      for (const ind of INDICATORS) {
        const c = STORY[crew.crew_id][ind]
        let v = c.from + (c.to - c.from) * progress + (rng() - 0.5) * 2 * c.noise
        if (ind === 'mood') v = Math.min(5, Math.max(1, v))
        out.push({
          id: `sim-${crew.crew_id}-d${String(d + 1).padStart(2, '0')}-${ind}`,
          crew_id: crew.crew_id,
          indicator: ind,
          value: round(v, c.decimals),
          unit: UNITS[ind],
          measured_at: at,
          source: 'simulated',
        })
      }
    }
  }
  return out
}
