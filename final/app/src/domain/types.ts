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
  /** Meta diaria de energía (kcal) para calcular el % de adecuación. */
  energyGoalKcal: number
  /** Masa corporal basal (kg) antes de la misión: base para proteína g/kg y % de pérdida. */
  baselineMassKg: number
}
