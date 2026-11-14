import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_ACCELERATED, DEFAULT_SCENARIO, delaySeconds } from '../../domain/delay'
import { actionKey, SYSTEMS, type SystemId, type SystemState } from '../../domain/systems'
import { classify, SOURCES, UNITS } from '../../domain/thresholds'
import type { CrewProfile, Indicator, Reading } from '../../domain/types'
import type { Store } from '../../data'
import { useT } from '../../i18n'
import { StatusBadge } from '../StatusBadge'

interface Props {
  system: SystemId
  state: SystemState
  profile: CrewProfile
  readings: Reading[]
  latest: Partial<Record<Indicator, Reading>>
  store: Store
  now: Date
}

const DAY_MS = 24 * 3600_000

export function SystemDetail({ system, state, profile, readings, latest, store, now }: Props) {
  const { t } = useT()
  const [sent, setSent] = useState(false)
  const def = SYSTEMS[system]
  const canNotify = state.status === 'alert' || state.status === 'critical'

  const notify = async () => {
    const deliver = new Date(now.getTime() + delaySeconds(DEFAULT_SCENARIO, { accelerated: DEFAULT_ACCELERATED }) * 1000)
    await store.sendMessage({
      crew_id: profile.crew_id,
      from_role: 'crew',
      body: t('crew.notify_body', { system: t(`system.${system}`), status: t(`status.${state.status}`) }),
      deliver_at: deliver.toISOString(),
    })
    setSent(true)
  }

  return (
    <section className="detail" aria-labelledby={`detail-${system}`}>
      <header className="detail__head">
        <h2 id={`detail-${system}`}>{t(`system.${system}`)}</h2>
        <StatusBadge status={state.status} incomplete={!state.complete} />
      </header>

      <div className="detail__block detail__action">
        <h3>{t('crew.detail.what_to_do')}</h3>
        <p>{t(actionKey(system, state.status))}</p>
        {canNotify && (
          <button type="button" className="btn btn--primary" onClick={notify} disabled={sent}>
            {sent ? `✓ ${t('crew.detail.notified')}` : t('crew.detail.notify')}
          </button>
        )}
      </div>

      {def.indicators.map((ind) => {
        const last = latest[ind]
        const series = readings
          .filter((r) => r.crew_id === profile.crew_id && r.indicator === ind)
          .filter((r) => now.getTime() - new Date(r.measured_at).getTime() <= 30 * DAY_MS)
          .sort((a, b) => a.measured_at.localeCompare(b.measured_at))
          .map((r) => ({ day: r.measured_at.slice(5, 10), value: r.value }))
        return (
          <div key={ind} className="detail__block">
            <div className="indicator__row">
              <span className="indicator__name">{t(`indicator.${ind}`)}</span>
              <span className="indicator__value">
                {last ? `${last.value} ${UNITS[ind]}` : '—'}
              </span>
              <StatusBadge status={last ? classify(ind, last.value, profile) : 'nodata'} />
            </div>
            {series.length > 1 && (
              <div className="chart" aria-label={`${t(`indicator.${ind}`)} · ${t('crew.detail.trend')}`} role="img">
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: -4 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={['auto', 'auto']} width={46} />
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="indicator__source">
              {t('crew.detail.source')}: {SOURCES[ind]}
            </p>
          </div>
        )
      })}

      <div className="detail__block">
        <h3>{t('crew.detail.hazard')}</h3>
        <p>
          <a href={def.hazardUrl} target="_blank" rel="noreferrer">
            {t(def.hazardKey)} ↗
          </a>
        </p>
      </div>
    </section>
  )
}
