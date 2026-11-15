// Prueba de carga del dominio (F6): 5.000 lecturas y 300 mensajes, todo lo que la UI calcula en cada render.
import { createServer } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const L = (p) => server.ssrLoadModule(p)
  const { generateMission, CREW } = await L('/src/domain/mission.ts')
  const { crewSeverity, evalContext, freshLatest, SYSTEM_IDS } = await L('/src/domain/systems.ts')
  const { systemActionLevel } = await L('/src/domain/actions.ts')
  const { rankCrew, pendingAlerts } = await L('/src/domain/ground.ts')
  const { buildReport } = await L('/src/domain/report.ts')
  const { badges, streak } = await L('/src/domain/engagement.ts')
  const { unreadCount } = await L('/src/domain/unread.ts')
  const now = new Date()
  let readings = []
  for (let s = 1; readings.length < 5000; s++) readings = readings.concat(generateMission(s, 30, now))
  readings = readings.slice(0, 5000)
  const messages = Array.from({ length: 300 }, (_, i) => ({ id: `m${i}`, crew_id: i % 2 ? 'crew-01' : 'crew-02', from_role: i % 3 ? 'ground' : 'crew', body: 'x'.repeat(200), created_at: new Date(now - i * 60e3).toISOString(), deliver_at: null }))
  const renderCrew = () => {
    const p = CREW[0]
    const sev = crewSeverity(readings, p, now)
    const latest = freshLatest(readings, p.crew_id, now)
    const ctx = evalContext(readings, p, now)
    SYSTEM_IDS.forEach((s) => systemActionLevel(s, latest, p, ctx))
    streak(readings, p.crew_id, now); badges(readings, p, now); unreadCount(messages, p.crew_id, null, now)
    return sev
  }
  const renderGround = () => { rankCrew(readings, CREW, now); pendingAlerts(messages, readings, CREW, {}, now) }
  const time = (label, fn, n = 20) => { fn(); const t0 = performance.now(); for (let i = 0; i < n; i++) fn(); const ms = (performance.now() - t0) / n; console.log(label.padEnd(36), ms.toFixed(1) + ' ms'); return ms }
  console.log(`datos: ${readings.length} lecturas, ${messages.length} mensajes`)
  const a = time('Crew (todo lo de un render)', renderCrew)
  const b = time('Ground (ranking + alertas)', renderGround)
  const c = time('Informe semanal', () => buildReport(readings, CREW[0], now), 10)
  console.log(a < 100 && b < 100 ? 'OK: bajo 100 ms por render' : 'LENTO: optimizar')
} finally { await server.close() }
