import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CrewRank } from '../../domain/ground'
import { SYSTEM_IDS, SYSTEMS, type SystemId } from '../../domain/systems'
import type { Reading } from '../../domain/types'
import type { Message, Store } from '../../data'
import { useT } from '../../i18n'
import { STATUS_ICON } from '../StatusBadge'
import { MessageComposer } from './MessageComposer'
import { Thread } from './Thread'

const DAY_MS = 24 * 3600_000
const LINE_COLORS = ['var(--accent)', '#c084fc', '#f472b6']

interface Props {
  rank: CrewRank
  readings: Reading[]
  messages: Message[]
  store: Store
  now: Date
}

export function CrewDetail({ rank, readings, messages, store, now }: Props) {
  const { t } = useT()
  const { profile, bySystem } = rank
  const [system, setSystem] = useState<SystemId>(rank.worstSystem ?? 'heart')
  const inds = SYSTEMS[system].indicators

  // Una fila por día con las series del sistema elegido (últimos 30 días).
  const rows = new Map<string, Record<string, number | string>>()
  for (const r of readings) {
    if (r.crew_id !== profile.crew_id || !inds.includes(r.indicator)) continue
    if (now.getTime() - new Date(r.measured_at).getTime() > 30 * DAY_MS) continue
    const day = r.measured_at.slice(5, 10)
    rows.set(day, { ...(rows.get(day) ?? { day }), [r.indicator]: r.value })
  }
  const data = [...rows.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)))

  return (
    <section className="crewdetail" aria-labelledby="crewdetail-title">
      <h2 id="crewdetail-title">
        {profile.name} <span className="muted">· {profile.crew_id}</span>
      </h2>

      <div className="syschips" role="tablist" aria-label={t('crew.body_map')}>
        {SYSTEM_IDS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={system === s}
            className={`syschip syschip--${bySystem[s].status}${system === s ? ' is-selected' : ''}`}
            onClick={() => setSystem(s)}
          >
            <span aria-hidden="true">{STATUS_ICON[bySystem[s].status]}</span> {t(`system.${s}`)}
            <span className="sr-only"> · {t(`status.${bySystem[s].status}`)}</span>
          </button>
        ))}
      </div>

      <div className="detail__block">
        <h3>{t('ground.trend_for', { system: t(`system.${system}`) })}</h3>
        <div role="img" aria-label={t('ground.trend_for', { system: t(`system.${system}`) })}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} minTickGap={24} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={['auto', 'auto']} width={44} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              {inds.map((ind, i) => (
                <Line
                  key={ind}
                  type="monotone"
                  dataKey={ind}
                  name={t(`indicator.${ind}`)}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="serieslegend">
          {inds.map((ind, i) => (
            <li key={ind}>
              <span className="swatch" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} aria-hidden="true" />
              {t(`indicator.${ind}`)}
            </li>
          ))}
        </ul>
      </div>

      <Thread crewId={profile.crew_id} messages={messages} now={now} />
      <MessageComposer rank={rank} store={store} />
    </section>
  )
}
