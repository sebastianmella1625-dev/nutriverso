import type { CrewRank } from '../../domain/ground'
import { useT } from '../../i18n'
import { StatusBadge } from '../StatusBadge'

export function CrewList({
  ranks,
  selectedId,
  onSelect,
}: {
  ranks: CrewRank[]
  selectedId: string | null
  onSelect: (crewId: string) => void
}) {
  const { t } = useT()
  return (
    <section className="crewlist" aria-labelledby="crewlist-title">
      <h2 id="crewlist-title">{t('ground.crew_list')}</h2>
      <ul>
        {ranks.map((r) => (
          <li key={r.profile.crew_id}>
            <button
              type="button"
              className={`crewlist__item crewlist__item--${r.worst}${selectedId === r.profile.crew_id ? ' is-selected' : ''}`}
              aria-current={selectedId === r.profile.crew_id ? 'true' : undefined}
              onClick={() => onSelect(r.profile.crew_id)}
            >
              <span className="crewlist__name">
                {r.profile.name} <span className="muted">· {r.profile.crew_id}</span>
              </span>
              <StatusBadge status={r.worst} />
              <span className="crewlist__why">
                {r.worstSystem ? t('ground.worst', { system: t(`system.${r.worstSystem}`) }) : t('ground.all_ok')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
