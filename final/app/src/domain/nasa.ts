import type { CrewProfile, Reading } from './types'

// Metas nutricionales NASA (spec-final §1, D-40, D-50, D-51).
// Fuente: NASA JSC-67378 (2020), "Nutritional Requirements for Exploration Missions up to 365 days",
// que cita la ecuación EER del Institute of Medicine (2005). Se usa 662 para hombres (valor IOM);
// JSC-67378 imprime 622 (≈40 kcal/día de diferencia), igual que en el prototipo de Miguel.

const DAY_MS = 864e5
const PA: Record<CrewProfile['activity'], number> = { high: 1.25, low: 1.11 }

/** Requerimiento estimado de energía (kcal/día). */
export function eer(p: CrewProfile, massKg: number): number {
  const pa = PA[p.activity]
  return p.sex === 'm'
    ? 662 - 9.53 * p.age + pa * (15.9 * massKg + 539.6 * p.heightM)
    : 354 - 6.91 * p.age + pa * (9.36 * massKg + 726 * p.heightM)
}

/** Meta de energía del día = EER + 200 kcal por hora de EVA (JSC-67378). */
export function energyTarget(p: CrewProfile, massKg: number): number {
  return eer(p, massKg) + 200 * p.evaHoursPerDay
}

/** Meta de líquidos (mL/día) = máx(32 mL × kg; 2500 hombres / 2100 mujeres) (JSC-67378). */
export function fluidTarget(p: CrewProfile, massKg: number): number {
  return Math.max(Math.round(32 * massKg), p.sex === 'm' ? 2500 : 2100)
}

/** Masa actual: la última registrada en 60 días; si no hay, la basal. */
export function currentMass(readings: Reading[], p: CrewProfile, now: Date): number {
  let best: Reading | null = null
  for (const r of readings) {
    if (r.crew_id !== p.crew_id || r.indicator !== 'body_mass_kg') continue
    if (now.getTime() - new Date(r.measured_at).getTime() > 60 * DAY_MS) continue
    if (!best || r.measured_at > best.measured_at) best = r
  }
  return best ? best.value : p.baselineMassKg
}

/** D-50: promedio del último valor de energía de cada uno de los últimos 3 días (hoy incluido). null si no hay datos. */
export function energyAvg3d(readings: Reading[], crewId: string, now: Date): number | null {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const perDay = new Map<number, Reading>()
  for (const r of readings) {
    if (r.crew_id !== crewId || r.indicator !== 'energy_kcal') continue
    const t = new Date(r.measured_at)
    const day = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
    if (today - day > 2 * DAY_MS || day > today) continue
    const prev = perDay.get(day)
    if (!prev || r.measured_at > prev.measured_at) perDay.set(day, r)
  }
  if (perDay.size === 0) return null
  const values = [...perDay.values()].map((r) => r.value)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}
