import type { Reading } from '../domain/types'
import { toRemoteCrew } from './supabaseStore'
import { ROOM_PATTERN } from './room'

/**
 * SQL de siembra de una sala (D-27). Se corre una vez en el SQL Editor de Supabase (rol postgres, sin RLS).
 * Las fechas quedan relativas a now(), así la misión siempre "termina hoy" cuando se corre.
 */
export function seedSql(room: string, readings: Reading[], end: Date): string {
  if (!ROOM_PATTERN.test(room)) throw new Error(`Unsafe room name: ${room}`)
  const rows = readings.map((r) => {
    const hoursAgo = ((end.getTime() - new Date(r.measured_at).getTime()) / 3600_000).toFixed(3)
    return `('${toRemoteCrew(room, r.crew_id)}','${r.indicator}',${r.value},'${r.unit}',now() - interval '${hoursAgo} hours','simulated')`
  })
  return [
    `-- NutriVerso seed for room "${room}" (simulated data). Re-run to reset the room.`,
    'begin;',
    `delete from messages where crew_id like '${room}:%';`,
    `delete from readings where crew_id like '${room}:%';`,
    'insert into readings (crew_id, indicator, value, unit, measured_at, source) values',
    rows.join(',\n') + ';',
    'commit;',
    '',
  ].join('\n')
}
