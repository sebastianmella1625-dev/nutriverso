import { describe, expect, it } from 'vitest'
import { CREW, generateMission } from './mission'
import { crewSeverity } from './systems'
import { validateReading } from './thresholds'

const END = new Date('2026-11-14T12:00:00Z')

describe('CREW (D-22)', () => {
  it('has Miguel as crew-01 and Camila as crew-02', () => {
    expect(CREW.map((c) => [c.crew_id, c.name])).toEqual([
      ['crew-01', 'Miguel'],
      ['crew-02', 'Camila'],
    ])
    expect(CREW[0]).toMatchObject({ energyGoalKcal: 2800, baselineMassKg: 75 })
    expect(CREW[1]).toMatchObject({ energyGoalKcal: 2300, baselineMassKg: 62 })
  })
})

describe('generateMission (D-21)', () => {
  it('is deterministic for the same seed and end date', () => {
    expect(generateMission(42, 30, END)).toEqual(generateMission(42, 30, END))
  })
  it('produces 30 days × 2 crew × 11 indicators', () => {
    expect(generateMission(42, 30, END)).toHaveLength(660)
  })
  it('every simulated value is plausible and marked simulated', () => {
    for (const r of generateMission(42, 30, END)) {
      expect(validateReading(r.indicator, r.value).ok).toBe(true)
      expect(r.source).toBe('simulated')
    }
  })
  it('the last day is fresh at the end date', () => {
    const last = generateMission(42, 30, END).map((r) => r.measured_at).sort().at(-1)!
    expect(new Date(last).getTime()).toBeLessThanOrEqual(END.getTime())
    expect(END.getTime() - new Date(last).getTime()).toBeLessThan(36 * 3600_000)
  })
  it('crew-01 (Miguel) ends with bone and muscle in alert or worse', () => {
    const sev = crewSeverity(generateMission(42, 30, END), CREW[0], END)
    expect(['alert', 'critical']).toContain(sev.bySystem.bone.status)
    expect(['alert', 'critical']).toContain(sev.bySystem.muscle.status)
    expect(sev.bySystem.heart.status).toBe('ok')
  })
  it('crew-02 (Camila) ends with mind in watch (D-21) and heart ok', () => {
    const sev = crewSeverity(generateMission(42, 30, END), CREW[1], END)
    expect(sev.bySystem.mind.status).toBe('watch')
    expect(sev.bySystem.heart.status).toBe('ok')
    expect(sev.bySystem.bone.status).toBe('ok')
  })
  it('the story holds for any seed (not luck of seed 42)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const data = generateMission(seed, 30, END)
      const miguel = crewSeverity(data, CREW[0], END).bySystem
      const camila = crewSeverity(data, CREW[1], END).bySystem
      expect(['alert', 'critical'], `seed ${seed} bone`).toContain(miguel.bone.status)
      expect(['alert', 'critical'], `seed ${seed} muscle`).toContain(miguel.muscle.status)
      expect(miguel.heart.status, `seed ${seed} heart`).toBe('ok')
      expect(camila.mind.status, `seed ${seed} mind`).toBe('watch')
      expect(camila.heart.status, `seed ${seed} camila heart`).toBe('ok')
    }
  })

  it('both crew start the mission healthy (day 1 all ok)', () => {
    const start = new Date(END.getTime() - 29 * 24 * 3600_000)
    const day1 = generateMission(42, 30, END).filter((r) => new Date(r.measured_at) <= start)
    for (const p of CREW) {
      const sev = crewSeverity(day1, p, start)
      expect(sev.bySystem.bone.status).toBe('ok')
      expect(sev.bySystem.muscle.status).toBe('ok')
    }
  })
})
