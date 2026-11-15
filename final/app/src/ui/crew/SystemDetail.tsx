import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_ACCELERATED, DEFAULT_SCENARIO, delaySeconds } from '../../domain/delay'
import { EVIDENCE, type ActionLevel } from '../../domain/actions'
import { energyTarget, fluidTarget } from '../../domain/nasa'
import { actionKey, indicatorStatus, SYSTEMS, type EvalContext, type SystemId, type SystemState } from '../../domain/systems'
import { SOURCES, UNITS } from '../../domain/thresholds'
import type { CrewProfile, Indicator, Reading } from '../../domain/types'
import type { Store } from '../../data'
import { useT } from '../../i18n'
import { LevelChip } from '../LevelChip'
import { StatusBadge } from '../StatusBadge'

interface Props {
  system: SystemId
  state: SystemState
  level: ActionLevel | null
  profile: CrewProfile
  readings: Reading[]
  latest: Partial<Record<Indicator, Reading>>
  ctx: EvalContext
  store: Store
  now: Date
}

const DAY_MS = 24 * 3600_000

/** Meta NASA visible por indicador nutricional (F2), con la masa actual. */
function targetText(ind: Indicator, profile: CrewProfile, ctx: EvalContext): string | null {
  if (ind === 'water_ml') return `≥ ${fluidTarget(profile, ctx.massKg)} mL`
  if (ind === 'energy_kcal') return `${Math.round(energyTarget(profile, ctx.massKg))} kcal`
  if (ind === 'protein_g') return `≥ ${Math.round(1.2 * ctx.massKg)} g (1.2 g/kg)`
  return null
}

export function SystemDetail({ system, state, level, profile, readings, latest, ctx, store, now }: Props) {
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
        {level && <LevelChip level={level} />}
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
              <StatusBadge status={indicatorStatus(ind, latest, profile, ctx)} />
            </div>
            {(ind === 'energy_kcal' && ctx.energyAvg !== null) || targetText(ind, profile, ctx) ? (
              <p className="indicator__target">
                {ind === 'energy_kcal' && ctx.energyAvg !== null && <>{t('crew.detail.avg3d', { v: `${ctx.energyAvg} kcal` })} · </>}
                {targetText(ind, profile, ctx) && t('crew.detail.target', { v: targetText(ind, profile, ctx) as string })}
              </p>
            ) : null}
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
              {t('crew.detail.source')}: {SOURCES[ind]} · <strong>{t(`evidence.${EVIDENCE[ind]}`)}</strong>
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
