import { describe, expect, it } from 'vitest'
import { DEFAULT_ACCELERATED, DEFAULT_SCENARIO, delaySeconds, isDelivered } from './delay'

describe('delaySeconds', () => {
  it('ISS has no meaningful delay', () => {
    expect(delaySeconds('iss', { accelerated: false })).toBe(0)
  })
  it('Moon is ~1.3 s one way', () => {
    expect(delaySeconds('moon', { accelerated: false })).toBe(1.3)
  })
  it('Mars real delay defaults to 12 min', () => {
    expect(delaySeconds('mars', { accelerated: false })).toBe(720)
  })
  it('Mars delay is clamped to 3–22 min', () => {
    expect(delaySeconds('mars', { accelerated: false, marsMinutes: 30 })).toBe(1320)
    expect(delaySeconds('mars', { accelerated: false, marsMinutes: 1 })).toBe(180)
  })
  it('accelerated demo turns Mars minutes into seconds', () => {
    expect(delaySeconds('mars', { accelerated: true, marsMinutes: 12 })).toBe(12)
  })
})

describe('defaults (D-19, D-20)', () => {
  it('mission is a Mars transit, accelerated by default', () => {
    expect(DEFAULT_SCENARIO).toBe('mars')
    expect(DEFAULT_ACCELERATED).toBe(true)
  })
})

describe('isDelivered', () => {
  const now = new Date('2026-11-14T12:00:00Z')
  it('a message without deliver_at is delivered', () => {
    expect(isDelivered({ deliver_at: null }, now)).toBe(true)
  })
  it('a message whose deliver_at is in the future is in transit', () => {
    expect(isDelivered({ deliver_at: '2026-11-14T12:00:05Z' }, now)).toBe(false)
  })
  it('a message is delivered exactly at deliver_at', () => {
    expect(isDelivered({ deliver_at: '2026-11-14T12:00:00Z' }, now)).toBe(true)
  })
})
