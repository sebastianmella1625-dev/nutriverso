import type { Reading } from '../domain/types'

// Contrato de datos: brief-prototipos.md §3. La UI solo conoce esta interfaz (mock o supabase).

export interface Message {
  id: string
  crew_id: string
  from_role: 'crew' | 'ground'
  body: string
  created_at: string
  deliver_at: string | null
}

export type NewReading = Omit<Reading, 'id'>
export type NewMessage = Omit<Message, 'id' | 'created_at'>

export interface Store {
  kind: 'mock' | 'supabase'
  /** Sala (D-28). null = modo local. */
  room: string | null
  /** Solo el modo local puede reiniciar desde la app (D-29). */
  canReset: boolean
  readings(): Promise<Reading[]>
  addReadings(r: NewReading[]): Promise<void>
  messages(): Promise<Message[]>
  sendMessage(m: NewMessage): Promise<void>
  /** Llama a `cb` cuando cambian los datos (esta pestaña, otras pestañas u otros dispositivos). Devuelve la función para desuscribirse. */
  subscribe(cb: () => void): () => void
  reset(): Promise<void>
}
