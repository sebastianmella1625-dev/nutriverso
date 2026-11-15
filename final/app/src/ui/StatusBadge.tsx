import type { Status } from '../domain/types'
import { useT } from '../i18n'

/** Ícono por estado: el color nunca va solo (constitution §4). */
export const STATUS_ICON: Record<Status, string> = {
  ok: '✓',
  watch: '!',
  alert: '▲',
  critical: '✖',
  nodata: '?',
}

export function StatusBadge({ status, incomplete = false }: { status: Status; incomplete?: boolean }) {
  const { t } = useT()
  return (
    <span className={`badge badge--${status}`}>
      <span aria-hidden="true">{STATUS_ICON[status]}</span> {t(`status.${status}`)}
      {incomplete && status !== 'nodata' && <span className="badge__note"> · {t('status.incomplete')}</span>}
    </span>
  )
}
