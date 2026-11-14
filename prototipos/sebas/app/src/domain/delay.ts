// Retardo de comunicación Tierra–nave (un tramo). D-19: misión en tránsito a Marte. D-20: demo acelerada.

export type Scenario = 'iss' | 'moon' | 'mars'

export const DEFAULT_SCENARIO: Scenario = 'mars'
export const DEFAULT_ACCELERATED = true
export const MARS_MINUTES_DEFAULT = 12
export const MARS_MINUTES_MIN = 3
export const MARS_MINUTES_MAX = 22

export function delaySeconds(s: Scenario, opts: { accelerated: boolean; marsMinutes?: number }): number {
  if (s === 'iss') return 0
  if (s === 'moon') return 1.3
  const minutes = Math.min(MARS_MINUTES_MAX, Math.max(MARS_MINUTES_MIN, opts.marsMinutes ?? MARS_MINUTES_DEFAULT))
  return opts.accelerated ? minutes : minutes * 60
}

/** Un mensaje está entregado si no tiene deliver_at o si ya pasó esa hora. */
export function isDelivered(msg: { deliver_at: string | null }, now: Date): boolean {
  if (!msg.deliver_at) return true
  return now.getTime() >= new Date(msg.deliver_at).getTime()
}
