import { describe, expect, it } from 'vitest'
import { unreadCount } from './unread'

const NOW = new Date('2026-11-15T12:00:00Z')
const iso = (msAgo: number) => new Date(NOW.getTime() - msAgo).toISOString()
const m = (from_role: 'crew' | 'ground', createdAgo: number, deliverAgo: number | null, crew_id = 'crew-01') => ({
  crew_id, from_role, created_at: iso(createdAgo), deliver_at: deliverAgo === null ? null : iso(deliverAgo),
})

describe('unreadCount (F6: the Messages badge counts only unread ground messages)', () => {
  it('counts delivered ground messages after the last time the inbox was opened', () => {
    const msgs = [m('ground', 60_000, 50_000), m('ground', 30_000, 20_000)]
    expect(unreadCount(msgs, 'crew-01', iso(40_000), NOW)).toBe(1)
  })
  it('counts everything delivered when the inbox was never opened', () => {
    expect(unreadCount([m('ground', 60_000, null), m('ground', 30_000, 20_000)], 'crew-01', null, NOW)).toBe(2)
  })
  it('does not count messages still in transit', () => {
    expect(unreadCount([m('ground', 5_000, -10_000)], 'crew-01', null, NOW)).toBe(0)
  })
  it('ignores crew messages and other crew members', () => {
    expect(unreadCount([m('crew', 5_000, null), m('ground', 5_000, null, 'crew-02')], 'crew-01', null, NOW)).toBe(0)
  })
  it('compares times as instants, not strings (Supabase +00:00 vs Z)', () => {
    const supa = { crew_id: 'crew-01', from_role: 'ground' as const, created_at: '2026-11-15T11:59:50+00:00', deliver_at: null }
    expect(unreadCount([supa], 'crew-01', '2026-11-15T11:59:55.000Z', NOW)).toBe(0)
    expect(unreadCount([supa], 'crew-01', '2026-11-15T11:59:45.000Z', NOW)).toBe(1)
  })
})
