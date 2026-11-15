import { en } from '../i18n/en'
import { actionLevel } from './actions'
import { energyTarget, fluidTarget } from './nasa'
import { evalContext, freshLatest, indicatorStatus } from './systems'
import { classify, UNITS } from './thresholds'
import { INDICATORS, type CrewProfile, type Indicator, type Reading } from './types'

// Informe semanal para el médico de vuelo (F4; idea de Miguel). 7 días fijos (D-54), siempre en inglés (D-55):
// es un documento para Tierra, no texto de interfaz. Se envía por el canal real con retardo (D-53).

const DAY_MS = 864e5
const dayKey = (t: Date | string) => new Date(t).toISOString().slice(0, 10)
const name = (ind: Indicator) => en[`indicator.${ind}`]
const ONE_DECIMAL: Indicator[] = ['body_mass_kg', 'sleep_hours', 'body_temp', 'mood']
const fmt = (ind: Indicator, v: number) => (ONE_DECIMAL.includes(ind) ? v.toFixed(1) : String(Math.round(v)))
const withUnit = (ind: Indicator, v: number) => (ind === 'mood' ? `${fmt(ind, v)}/5` : `${fmt(ind, v)} ${UNITS[ind]}`)

export function buildReport(readings: Reading[], profile: CrewProfile, now: Date, days = 7): string {
  const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS)))
  const inWindow = new Set(keys)
  const mine = readings.filter((r) => r.crew_id === profile.crew_id && inWindow.has(dayKey(r.measured_at)))

  // Último valor de cada indicador por día
  const perDay = new Map<Indicator, Map<string, Reading>>()
  for (const r of mine) {
    const m = perDay.get(r.indicator) ?? new Map<string, Reading>()
    const k = dayKey(r.measured_at)
    const prev = m.get(k)
    if (!prev || r.measured_at > prev.measured_at) m.set(k, r)
    perDay.set(r.indicator, m)
  }
  const daysLogged = new Set(mine.map((r) => dayKey(r.measured_at))).size

  const lines: string[] = [
    'NUTRIVERSO · WEEKLY HEALTH REPORT',
    `Crew: ${profile.name} (${profile.crew_id}) · Mission: Mars transit`,
    `Period: ${keys[0]} → ${keys[keys.length - 1]} · Days logged: ${daysLogged}/${days}`,
    '',
  ]
  if (mine.length === 0) {
    lines.push('No readings in the last 7 days. Please complete a check-in.', '')
    lines.push('Simulated data · NutriVerso (NASA Space Apps 2026) · Not a diagnostic device.')
    return lines.join('\n')
  }

  // Estado actual: lo mismo que ve el astronauta (vigencia, promedio de energía, masa actual)
  const latest = freshLatest(readings, profile.crew_id, now)
  const ctx = evalContext(readings, profile, now)
  const current = (ind: Indicator) => {
    if (ind === 'body_mass_kg' && latest[ind]) {
      const v = latest[ind]!.value
      const pct = ((profile.baselineMassKg - v) / profile.baselineMassKg) * 100
      return `${name(ind)} ${withUnit(ind, v)} (${pct >= 0 ? '−' : '+'}${Math.abs(pct).toFixed(1)} % vs baseline)`
    }
    if (ind === 'energy_kcal' && ctx.energyAvg !== null) {
      return `${name(ind)} ${ctx.energyAvg} kcal 3-day avg (${Math.round((ctx.energyAvg / energyTarget(profile, ctx.massKg)) * 100)} % of NASA target)`
    }
    return latest[ind] ? `${name(ind)} ${withUnit(ind, latest[ind]!.value)}` : name(ind)
  }
  const byLevel = (lvl: 'now' | 'report') =>
    INDICATORS.filter((ind) => actionLevel(ind, indicatorStatus(ind, latest, profile, ctx)) === lvl).map(current)

  const now_ = byLevel('now')
  if (now_.length) lines.push(`⚠ NOTIFY NOW: ${now_.join('; ')}`, '')
  const report = byLevel('report')
  if (report.length) lines.push(`WEEKLY REPORT ITEMS: ${report.join('; ')}`, '')

  // Promedios de 7 días con su meta NASA
  lines.push('7-DAY AVERAGES:')
  for (const ind of INDICATORS) {
    const vals = [...(perDay.get(ind)?.values() ?? [])].map((r) => r.value)
    if (vals.length === 0) continue
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    if (ind === 'water_ml') {
      const tgt = fluidTarget(profile, ctx.massKg)
      lines.push(`- ${name(ind)}: ${Math.round(avg)} mL avg (NASA target ≥ ${tgt} mL, ${Math.round((avg / tgt) * 100)} %)`)
    } else if (ind === 'energy_kcal') {
      const tgt = Math.round(energyTarget(profile, ctx.massKg))
      lines.push(`- ${name(ind)}: ${Math.round(avg)} kcal avg (NASA target ${tgt} kcal, ${Math.round((avg / tgt) * 100)} %)`)
    } else if (ind === 'protein_g') {
      lines.push(`- ${name(ind)}: ${Math.round(avg)} g avg (NASA target ≥ ${Math.round(1.2 * ctx.massKg)} g)`)
    } else {
      lines.push(`- ${name(ind)}: ${withUnit(ind, avg)} avg`)
    }
  }

  // Días en alerta o peor
  const bad: string[] = []
  for (const ind of INDICATORS) {
    const day = [...(perDay.get(ind)?.values() ?? [])]
    const k = day.filter((r) => ['alert', 'critical'].includes(classify(ind, r.value, profile, ctx.massKg))).length
    if (k > 0) bad.push(`- ${name(ind)}: ${k}/${day.length} days`)
  }
  if (bad.length) lines.push('', 'DAYS IN ALERT OR WORSE:', ...bad)

  lines.push('', 'Simulated data · NutriVerso (NASA Space Apps 2026) · Not a diagnostic device.')
  return lines.join('\n')
}
