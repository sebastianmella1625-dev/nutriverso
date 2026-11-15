/** Nombres de sala seguros: 3–32 caracteres, minúsculas, dígitos y guion (se usan dentro de SQL y de crew_id). */
export const ROOM_PATTERN = /^[a-z0-9-]{3,32}$/

/** D-28: lee `?room=` de la URL. Devuelve null si falta o no es seguro. */
export function roomFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get('room')
  if (!raw) return null
  const room = raw.trim().toLowerCase()
  return ROOM_PATTERN.test(room) ? room : null
}
