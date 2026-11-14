import { useEffect, useState } from 'react'

/** Fecha actual que se actualiza cada `ms` (cuentas regresivas de mensajes y vigencia de lecturas). */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
