import type { ActionLevel } from '../domain/actions'
import { useT } from '../i18n'

/** Nivel de acción (D-52): ícono + texto, nunca solo color. */
export const LEVEL_ICON: Record<ActionLevel, string> = { now: '📡', report: '🗒', self: '🧭' }

export function LevelChip({ level }: { level: ActionLevel }) {
  const { t } = useT()
  return (
    <span className={`level level--${level}`}>
      <span aria-hidden="true">{LEVEL_ICON[level]}</span> {t(`level.${level}`)}
    </span>
  )
}
