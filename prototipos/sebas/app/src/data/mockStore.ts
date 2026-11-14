import { generateMission } from '../domain/mission'
import type { Reading } from '../domain/types'
import type { Message, NewMessage, NewReading, Store } from './store'

// Modo local (D-26): localStorage + BroadcastChannel. Sincroniza en vivo pestañas del mismo navegador.

const K_READINGS = 'nv.readings'
const K_MESSAGES = 'nv.messages'
const CHANNEL = 'nv-sync'
const SEED = 42

function load<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null // JSON corrupto o storage bloqueado → se resiembra
  }
}

function save(key: string, value: unknown[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage lleno o bloqueado: los datos siguen en memoria en esta pestaña */
  }
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function createMockStore(now: () => Date = () => new Date()): Store {
  let readings: Reading[] = load<Reading>(K_READINGS) ?? []
  let messages: Message[] = load<Message>(K_MESSAGES) ?? []
  if (readings.length === 0) {
    readings = generateMission(SEED, 30, now())
    save(K_READINGS, readings)
  }

  const listeners = new Set<() => void>()
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null

  const refreshFromStorage = () => {
    readings = load<Reading>(K_READINGS) ?? readings
    messages = load<Message>(K_MESSAGES) ?? messages
  }
  const fromOtherTab = () => {
    refreshFromStorage()
    listeners.forEach((cb) => cb())
  }
  channel?.addEventListener('message', fromOtherTab)
  // Segunda vía: el evento `storage` llega aunque BroadcastChannel se pierda (pestaña congelada en segundo plano).
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === K_READINGS || e.key === K_MESSAGES) fromOtherTab()
    })
  }

  const changed = () => {
    save(K_READINGS, readings)
    save(K_MESSAGES, messages)
    listeners.forEach((cb) => cb()) // esta pestaña
    channel?.postMessage('changed') // otras pestañas
  }

  return {
    kind: 'mock',
    room: null,
    canReset: true,
    readings: async () => {
      refreshFromStorage()
      return [...readings]
    },
    addReadings: async (rs: NewReading[]) => {
      refreshFromStorage() // leer lo último guardado por otras pestañas antes de agregar (evita pérdida de datos)
      readings = [...readings, ...rs.map((r) => ({ ...r, id: newId() }))]
      changed()
    },
    messages: async () => {
      refreshFromStorage()
      return [...messages]
    },
    sendMessage: async (m: NewMessage) => {
      refreshFromStorage() // ídem: no pisar mensajes de otra pestaña
      messages = [...messages, { ...m, id: newId(), created_at: now().toISOString() }]
      changed()
    },
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    reset: async () => {
      readings = generateMission(SEED, 30, now())
      messages = []
      changed()
    },
  }
}
