import { INDICATORS, type CrewProfile, type Indicator, type Reading } from './types'

// Gamificación (D-33) y check-in semanal de masa (D-32).
// Días en UTC (YYYY-MM-DD). Si hoy aún no hay datos, todo se cuenta hasta ayer, así nada se "rompe" cada mañana.

const DAY_MS = 24 * 3600_000
const dayKey = (t: Date | string) => new Date(t).toISOString().slice(0, 10)

/** Último valor de `ind` por día, para un tripulante. */
function byDay(readings: Reading[], crewId: string, ind?: Indicator): Map<string, Reading> {
  const out = new Map<string, Reading>()
  for (const r of readings) {
    if (r.crew_id !== crewId || (ind && r.indicator !== ind)) continue
    const k = dayKey(r.measured_at)
    const prev = out.get(k)
    if (!prev || r.measured_at > prev.measured_at) out.set(k, r)
  }
  return out
}

/** Días hacia atrás desde hoy (o desde ayer si hoy no hay datos). */
function windowDays(days: Map<string, Reading>, now: Date, n: number): string[] {
  const anchor = days.has(dayKey(now)) ? now.getTime() : now.getTime() - DAY_MS
  return Array.from({ length: n }, (_, i) => dayKey(new Date(anchor - i * DAY_MS)))
}

export function streak(readings: Reading[], crewId: string, now: Date): number {
  const days = byDay(readings, crewId)
  if (days.size === 0) return 0
  let count = 0
  for (const k of windowDays(days, now, days.size + 1)) {
    if (!days.has(k)) break
    count++
  }
  return count
}

function lastNDaysMeet(readings: Reading[], crewId: string, ind: Indicator, now: Date, n: number, min: number) {
  const anyDays = byDay(readings, crewId)
  const values = byDay(readings, crewId, ind)
  return windowDays(anyDays, now, n).every((k) => (values.get(k)?.value ?? -Infinity) >= min)
}

export interface Badges {
  first_week: boolean
  hydration_5: boolean
  sleep_5: boolean
}

export function badges(readings: Reading[], profile: CrewProfile, now: Date): Badges {
  const id = profile.crew_id
  return {
    first_week: streak(readings, id, now) >= 7,
    hydration_5: lastNDaysMeet(readings, id, 'water_ml', now, 5, 2000),
    sleep_5: lastNDaysMeet(readings, id, 'sleep_hours', now, 5, 7),
  }
}

/** D-32: la masa se pide si no hay registro o el último tiene 7 días o más. */
export function needsBodyMass(readings: Reading[], crewId: string, now: Date): boolean {
  let last = -Infinity
  for (const r of readings) {
    if (r.crew_id === crewId && r.indicator === 'body_mass_kg') last = Math.max(last, new Date(r.measured_at).getTime())
  }
  return now.getTime() - last >= 7 * DAY_MS
}

export function checkinIndicators(readings: Reading[], crewId: string, now: Date): Indicator[] {
  const daily = INDICATORS.filter((i) => i !== 'body_mass_kg')
  return needsBodyMass(readings, crewId, now) ? [...daily, 'body_mass_kg'] : daily
}
