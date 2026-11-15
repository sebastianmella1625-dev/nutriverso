import { isDelivered } from './delay'

type MsgLike = { crew_id: string; from_role: string; created_at: string; deliver_at: string | null }

/** Instante en ms; tolera los formatos de Supabase (+00:00, microsegundos) y de JS (Z). */
export const ms = (iso: string) => new Date(iso).getTime()

/** F6: mensajes de Tierra ya entregados que el astronauta no ha visto desde `lastSeen` (ISO o null = nunca). */
export function unreadCount(messages: MsgLike[], crewId: string, lastSeen: string | null, now: Date): number {
  const seen = lastSeen ? ms(lastSeen) : -Infinity
  return messages.filter(
    (m) => m.crew_id === crewId && m.from_role === 'ground' && isDelivered(m, now) && ms(m.deliver_at ?? m.created_at) > seen,
  ).length
}
