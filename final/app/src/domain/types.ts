// Tipos del dominio. TypeScript puro: no importa React ni la capa de datos.
// Los nombres de indicadores son el contrato de datos de brief-prototipos.md §3.

export const INDICATORS = [
  'heart_rate',
  'bp_systolic',
  'bp_diastolic',
  'glucose',
  'body_temp',
  'sleep_hours',
  'mood',
  'water_ml',
  'energy_kcal',
  'protein_g',
  'body_mass_kg',
] as const

export type Indicator = (typeof INDICATORS)[number]

/** Estado de un indicador o sistema. `nodata` = no hay lectura (no es "ok"). */
export type Status = 'ok' | 'watch' | 'alert' | 'critical' | 'nodata'

export interface Reading {
  id: string
  crew_id: string
  indicator: Indicator
  value: number
  unit: string
  measured_at: string // ISO 8601
  source: string // 'simulated' en este prototipo
}

export interface CrewProfile {
  crew_id: string
  name: string
  /** Para la ecuación EER y la meta de líquidos (NASA JSC-67378). */
  sex: 'm' | 'f'
  age: number
  heightM: number
  /** Actividad física: alta = PA 1,25 (por defecto en la ISS), baja = PA 1,11. */
  activity: 'high' | 'low'
  /** Horas de EVA promedio por día (D-51): suman 200 kcal/h a la meta de energía. */
  evaHoursPerDay: number
  /** Masa corporal basal (kg) antes de la misión: base del % de pérdida y respaldo si no hay masa reciente. */
  baselineMassKg: number
}
