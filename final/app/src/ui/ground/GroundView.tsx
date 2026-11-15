import { useState } from 'react'
import { pendingAlerts, rankCrew } from '../../domain/ground'
import { CREW } from '../../domain/mission'
import type { Reading } from '../../domain/types'
import type { Message, Store } from '../../data'
import { useT } from '../../i18n'
import { SpaceWeatherCard } from '../SpaceWeatherCard'
import { CrewDetail } from './CrewDetail'
import { CrewList } from './CrewList'

interface Props {
  readings: Reading[]
  messages: Message[]
  store: Store
  now: Date
}

/** D-34: consola del flight surgeon. Izquierda: tripulación por gravedad. Derecha: detalle, conversación y envío. */
export function GroundView({ readings, messages, store, now }: Props) {
  const { t } = useT()
  const ranks = rankCrew(readings, CREW, now)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [seen, setSeen] = useState<Record<string, string>>({})

  const open = (crewId: string) => {
    setSelectedId(crewId)
    setSeen((s) => ({ ...s, [crewId]: new Date().toISOString() }))
  }

  const alerts = pendingAlerts(messages, readings, CREW, seen, now)
  const current = ranks.find((r) => r.profile.crew_id === (selectedId ?? ranks[0]?.profile.crew_id))

  return (
    <div className="ground">
      <h1 className="ground__title">{t('ground.title')}</h1>

      {alerts.length > 0 && (
        <ul className="alerts" role="alert">
          {alerts.map((a) => (
            <li key={`${a.crew_id}-${a.kind}`} className={`alerts__item alerts__item--${a.kind}`}>
              <span>
                {a.kind === 'critical' ? '✖ ' : '📡 '}
                {a.kind === 'critical'
                  ? t('ground.alert_critical', { name: a.name, system: t(`system.${a.system}`) })
                  : t('ground.alert_notify', { name: a.name })}
              </span>
              <button type="button" className="btn btn--small" onClick={() => open(a.crew_id)}>
                {t('ground.open')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <SpaceWeatherCard />

      <div className="ground__grid">
        <CrewList ranks={ranks} selectedId={current?.profile.crew_id ?? null} onSelect={open} />
        {current && (
          <CrewDetail key={current.profile.crew_id} rank={current} readings={readings} messages={messages} store={store} now={now} />
        )}
      </div>
    </div>
  )
}
