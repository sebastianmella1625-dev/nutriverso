import { isDelivered } from './delay'
import { actionKey, compareSeverity, crewSeverity, SYSTEM_IDS, type SystemId, type SystemState } from './systems'
import type { CrewProfile, Reading, Status } from './types'

// Lógica de la consola Ground (D-34 ranking, D-35 alertas, D-36 sugerencia de mensaje).

export interface CrewRank {
  profile: CrewProfile
  worst: Status
  worstSystem: SystemId | null
  bySystem: Record<SystemId, SystemState>
}

export interface GroundAlert {
  crew_id: string
  kind: 'notify' | 'critical'
  name: string
  system?: SystemId
}

/** El sistema más grave; null si todo está ok o sin datos (no hay nada que atender). */
export function worstSystem(bySystem: Record<SystemId, SystemState>): SystemId | null {
  const sorted = [...SYSTEM_IDS].sort((a, b) => compareSeverity(bySystem[a].status, bySystem[b].status))
  const top = sorted[0]
  const st = bySystem[top].status
  return st === 'ok' || st === 'nodata' ? null : top
}

/** Tripulación ordenada por gravedad (el más afectado primero; empate por nombre). */
export function rankCrew(readings: Reading[], crew: CrewProfile[], now: Date): CrewRank[] {
  return crew
    .map((profile) => {
      const sev = crewSeverity(readings, profile, now)
      return { profile, worst: sev.worst, worstSystem: worstSystem(sev.bySystem), bySystem: sev.bySystem }
    })
    .sort((a, b) => compareSeverity(a.worst, b.worst) || a.profile.name.localeCompare(b.profile.name))
}

/** D-36: clave i18n de la recomendación para el peor sistema (para precargar el mensaje de Ground). */
export function suggestionKey(bySystem: Record<SystemId, SystemState>): string | null {
  const s = worstSystem(bySystem)
  return s ? actionKey(s, bySystem[s].status) : null
}

type MsgLike = { crew_id: string; from_role: string; created_at: string; deliver_at: string | null }

/**
 * D-35: alertas que Ground aún no ha visto.
 * - notify: aviso del crew ya entregado en Tierra (respeta el retardo) y posterior a la última vez que Ground abrió a ese tripulante.
 * - critical: algún sistema en crítico, hasta que Ground abra al tripulante después de su última lectura.
 * `seen[crew_id]` = ISO de la última vez que Ground abrió a ese tripulante.
 */
export function pendingAlerts(
  messages: MsgLike[],
  readings: Reading[],
  crew: CrewProfile[],
  seen: Record<string, string>,
  now: Date,
): GroundAlert[] {
  const out: GroundAlert[] = []
  for (const p of crew) {
    const seenAt = seen[p.crew_id] ?? ''
    const notified = messages.some(
      (m) =>
        m.crew_id === p.crew_id &&
        m.from_role === 'crew' &&
        isDelivered(m, now) &&
        (m.deliver_at ?? m.created_at) > seenAt,
    )
    if (notified) out.push({ crew_id: p.crew_id, kind: 'notify', name: p.name })

    const sev = crewSeverity(readings, p, now)
    const critical = SYSTEM_IDS.find((s) => sev.bySystem[s].status === 'critical')
    if (critical) {
      const latest = readings
        .filter((r) => r.crew_id === p.crew_id)
        .reduce((max, r) => (r.measured_at > max ? r.measured_at : max), '')
      if (!seenAt || seenAt < latest) out.push({ crew_id: p.crew_id, kind: 'critical', name: p.name, system: critical })
    }
  }
  return out
}
