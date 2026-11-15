// Genera el seed.sql de una sala (D-27): npm run seed -- <room>
// Escribe ../supabase/seed-<room>.sql para pegarlo en el SQL Editor de Supabase.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const room = (process.argv[2] ?? '').trim().toLowerCase()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { seedSql } = await server.ssrLoadModule('/src/data/seedSql.ts')
  const { generateMission } = await server.ssrLoadModule('/src/domain/mission.ts')
  const end = new Date()
  const sql = seedSql(room, generateMission(42, 30, end), end) // lanza si el nombre de sala no es seguro
  const out = resolve(root, '..', 'supabase', `seed-${room}.sql`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, sql)
  console.log(`OK → ${out}`)
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e))
  process.exitCode = 1
} finally {
  await server.close()
}
