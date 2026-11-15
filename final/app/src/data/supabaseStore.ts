import { createClient } from '@supabase/supabase-js'
import type { Reading } from '../domain/types'
import type { Message, NewMessage, NewReading, Store } from './store'

// Modo sala (D-28): Supabase Realtime. Cada sala se aísla con el prefijo "<room>:" en crew_id.

export const toRemoteCrew = (room: string, crewId: string) => `${room}:${crewId}`
export const fromRemoteCrew = (room: string, remote: string) =>
  remote.startsWith(`${room}:`) ? remote.slice(room.length + 1) : remote

const MAX_ROWS = 5000 // por defecto Supabase devuelve 1000 filas como máximo

export function createSupabaseStore(url: string, anonKey: string, room: string): Store {
  const db = createClient(url, anonKey)
  const like = `${room}:%`

  return {
    kind: 'supabase',
    room,
    canReset: false, // D-29: las salas se reinician con seed.sql
    readings: async () => {
      const { data, error } = await db
        .from('readings')
        .select('*')
        .like('crew_id', like)
        .order('measured_at')
        .range(0, MAX_ROWS - 1)
      if (error) throw error
      return (data as Reading[]).map((r) => ({ ...r, value: Number(r.value), crew_id: fromRemoteCrew(room, r.crew_id) }))
    },
    addReadings: async (rs: NewReading[]) => {
      const { error } = await db.from('readings').insert(rs.map((r) => ({ ...r, crew_id: toRemoteCrew(room, r.crew_id) })))
      if (error) throw error
    },
    messages: async () => {
      const { data, error } = await db.from('messages').select('*').like('crew_id', like).order('created_at')
      if (error) throw error
      return (data as Message[]).map((m) => ({ ...m, crew_id: fromRemoteCrew(room, m.crew_id) }))
    },
    sendMessage: async (m: NewMessage) => {
      const { error } = await db.from('messages').insert({ ...m, crew_id: toRemoteCrew(room, m.crew_id) })
      if (error) throw error
    },
    subscribe: (cb) => {
      // postgres_changes no filtra con LIKE: se recibe todo y se recarga (el volumen de la demo es bajo).
      const ch = db
        .channel(`nv-${room}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'readings' }, cb)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, cb)
        .subscribe()
      return () => {
        void db.removeChannel(ch)
      }
    },
    reset: async () => {
      throw new Error('Reset a room by re-running its seed.sql in the Supabase SQL Editor')
    },
  }
}
