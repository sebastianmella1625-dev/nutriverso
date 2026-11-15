import { currentMass, energyAvg3d } from './nasa'
import { classify } from './thresholds'
import type { CrewProfile, Indicator, Reading, Status } from './types'

// Sistemas corporales de la figura humana. Decisiones: D-15 (mapa), D-16 (manda el peor),
// D-17 (parcial + "incompleto"), D-18 (vigencia por indicador). Ver sdd/decisiones.md.

export const SYSTEM_IDS = ['mind', 'heart', 'bone', 'muscle', 'immune'] as const
export type SystemId = (typeof SYSTEM_IDS)[number]

export interface SystemState {
  status: Status
  /** false si falta (o está vencido) al menos un indicador del sistema. */
  complete: boolean
}

const HRP_HAZARDS = 'https://www.nasa.gov/hrp/hazards/'
const HRP_RISKS = 'https://www.nasa.gov/hrp/risks/'

export const SYSTEMS: Record<SystemId, { indicators: Indicator[]; hazardKey: string; hazardUrl: string }> = {
  mind: { indicators: ['mood', 'sleep_hours'], hazardKey: 'hazard.isolation', hazardUrl: HRP_HAZARDS },
  heart: {
    indicators: ['heart_rate', 'bp_systolic', 'bp_diastolic'],
    hazardKey: 'hazard.gravity_fluid_shift',
    hazardUrl: HRP_HAZARDS,
  },
  bone: { indicators: ['water_ml', 'energy_kcal'], hazardKey: 'hazard.gravity_bone', hazardUrl: HRP_HAZARDS },
  muscle: { indicators: ['protein_g', 'body_mass_kg'], hazardKey: 'hazard.gravity_muscle_nutrition', hazardUrl: HRP_RISKS },
  immune: { indicators: ['body_temp', 'glucose'], hazardKey: 'hazard.environment_radiation', hazardUrl: HRP_HAZARDS },
}

/** D-18: horas que una medición sigue vigente. */
const FRESH_HOURS_DEFAULT = 36
const FRESH_HOURS: Partial<Record<Indicator, number>> = { body_mass_kg: 8 * 24 }

/** Última lectura vigente de cada indicador para un tripulante. */
export function freshLatest(readings: Reading[], crewId: string, now: Date): Partial<Record<Indicator, Reading>> {
  const latest: Partial<Record<Indicator, Reading>> = {}
  for (const rd of readings) {
    if (rd.crew_id !== crewId) continue
    const ageH = (now.getTime() - new Date(rd.measured_at).getTime()) / 3600_000
    if (ageH > (FRESH_HOURS[rd.indicator] ?? FRESH_HOURS_DEFAULT)) continue
    const prev = latest[rd.indicator]
    if (!prev || rd.measured_at > prev.measured_at) latest[rd.indicator] = rd
  }
  return latest
}

/** Orden de gravedad para rankear (Ground): critical > alert > watch > nodata > ok. */
export const SEVERITY_ORDER: Status[] = ['critical', 'alert', 'watch', 'nodata', 'ok']

export function compareSeverity(a: Status, b: Status): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b)
}

/** El peor estado entre los medidos; 'nodata' solo si no hay ninguno medido. */
function worstMeasured(statuses: Status[]): Status {
  const measured = statuses.filter((s) => s !== 'nodata')
  if (measured.length === 0) return 'nodata'
  return measured.sort(compareSeverity)[0]
}

/** Contexto NASA del tripulante (F2): masa actual y promedio de energía de 3 días (D-50). */
export interface EvalContext {
  massKg: number
  energyAvg: number | null
}

export function evalContext(readings: Reading[], profile: CrewProfile, now: Date): EvalContext {
  return { massKg: currentMass(readings, profile, now), energyAvg: energyAvg3d(readings, profile.crew_id, now) }
}

/** Estado de un indicador con su contexto: la energía usa el promedio de 3 días; el resto, la última lectura vigente. */
export function indicatorStatus(
  ind: Indicator,
  latest: Partial<Record<Indicator, Reading>>,
  profile: CrewProfile,
  ctx: EvalContext,
): Status {
  if (ind === 'energy_kcal') return ctx.energyAvg === null ? 'nodata' : classify(ind, ctx.energyAvg, profile, ctx.massKg)
  const rd = latest[ind]
  return rd ? classify(ind, rd.value, profile, ctx.massKg) : 'nodata'
}

export function systemStatus(
  sys: SystemId,
  latest: Partial<Record<Indicator, Reading>>,
  profile: CrewProfile,
  ctx: EvalContext = { massKg: profile.baselineMassKg, energyAvg: latest.energy_kcal?.value ?? null },
): SystemState {
  const statuses = SYSTEMS[sys].indicators.map((ind) => indicatorStatus(ind, latest, profile, ctx))
  return { status: worstMeasured(statuses), complete: statuses.every((s) => s !== 'nodata') }
}

export function crewSeverity(
  readings: Reading[],
  profile: CrewProfile,
  now: Date,
): { worst: Status; bySystem: Record<SystemId, SystemState> } {
  const latest = freshLatest(readings, profile.crew_id, now)
  const ctx = evalContext(readings, profile, now)
  const bySystem = Object.fromEntries(
    SYSTEM_IDS.map((s) => [s, systemStatus(s, latest, profile, ctx)]),
  ) as Record<SystemId, SystemState>
  return { worst: worstMeasured(SYSTEM_IDS.map((s) => bySystem[s].status)), bySystem }
}

export function actionKey(sys: SystemId, status: Status): string {
  return `action.${sys}.${status}`
}
