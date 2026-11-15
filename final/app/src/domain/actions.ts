import { indicatorStatus, SYSTEMS, type EvalContext, type SystemId } from './systems'
import type { CrewProfile, Indicator, Reading, Status } from './types'

// Niveles de acción (idea de Miguel; tabla "híbrido seguro", D-52) y nivel de evidencia por indicador (F3).
// Responde la pregunta del reto: ¿cuándo amerita atención de la tripulación o de los flight surgeons?

export type ActionLevel = 'now' | 'report' | 'self'
export const LEVEL_ORDER: ActionLevel[] = ['now', 'report', 'self']

const VITALS: Indicator[] = ['heart_rate', 'bp_systolic', 'bp_diastolic', 'body_temp', 'glucose']
const SLOW: Indicator[] = ['sleep_hours', 'body_mass_kg', 'protein_g', 'energy_kcal'] // problemas que se instalan en días

export function actionLevel(ind: Indicator, status: Status): ActionLevel | null {
  if (status === 'ok' || status === 'nodata') return null
  if (VITALS.includes(ind)) return status === 'critical' ? 'now' : 'self'
  if (ind === 'mood') return status === 'critical' ? 'now' : status === 'alert' ? 'report' : 'self'
  if (SLOW.includes(ind)) return status === 'watch' ? 'self' : 'report'
  return 'self' // agua: siempre autocuidado (el texto crítico agrega "si no mejora en 24 h, avisa")
}

export function mostUrgent(levels: (ActionLevel | null)[]): ActionLevel | null {
  return LEVEL_ORDER.find((l) => levels.includes(l)) ?? null
}

export function systemActionLevel(
  sys: SystemId,
  latest: Partial<Record<Indicator, Reading>>,
  profile: CrewProfile,
  ctx: EvalContext,
): ActionLevel | null {
  return mostUrgent(SYSTEMS[sys].indicators.map((ind) => actionLevel(ind, indicatorStatus(ind, latest, profile, ctx))))
}

/**
 * Nivel de evidencia del umbral de cada indicador (se muestra junto a su fuente).
 * strong = guía clínica o requisito NASA directo; moderate = rango de referencia o requisito con cortes del equipo;
 * team = escala definida por el equipo.
 */
export type Evidence = 'strong' | 'moderate' | 'weak' | 'team'
export const EVIDENCE: Record<Indicator, Evidence> = {
  bp_systolic: 'strong', // AHA/ACC 2017
  bp_diastolic: 'strong',
  glucose: 'strong', // ADA 2026
  heart_rate: 'moderate', // rango AHA; cortes extremos del equipo
  body_temp: 'moderate', // criterios clínicos generales
  sleep_hours: 'moderate', // consenso AASM/SRS en Tierra
  mood: 'team',
  water_ml: 'strong', // meta NASA JSC-67378 (cortes % del equipo)
  energy_kcal: 'moderate', // ecuación IOM/NASA; cortes del equipo
  protein_g: 'moderate', // JSC-67378
  body_mass_kg: 'moderate', // NASA Food & Nutrition Risk Rev D
}
