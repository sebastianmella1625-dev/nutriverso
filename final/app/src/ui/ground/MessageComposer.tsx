import { useState } from 'react'
import {
  DEFAULT_ACCELERATED,
  DEFAULT_SCENARIO,
  delaySeconds,
  MARS_MINUTES_DEFAULT,
  MARS_MINUTES_MAX,
  MARS_MINUTES_MIN,
  type Scenario,
} from '../../domain/delay'
import { suggestionKey, type CrewRank } from '../../domain/ground'
import type { Store } from '../../data'
import { useT } from '../../i18n'

/** D-36: cuadro precargado con la recomendación del peor sistema; D-19/D-20: retardo según distancia, acelerado por defecto. */
export function MessageComposer({ rank, store }: { rank: CrewRank; store: Store }) {
  const { t } = useT()
  const sugKey = suggestionKey(rank.bySystem)
  const [body, setBody] = useState(() => (sugKey ? t(sugKey) : ''))
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO)
  const [marsMinutes, setMarsMinutes] = useState(MARS_MINUTES_DEFAULT)
  const [accelerated, setAccelerated] = useState(DEFAULT_ACCELERATED)
  const [sentInfo, setSentInfo] = useState<string | null>(null)

  const delay = delaySeconds(scenario, { accelerated, marsMinutes })

  const send = async () => {
    const text = body.trim()
    if (!text) return
    const deliver = new Date(Date.now() + delay * 1000)
    await store.sendMessage({
      crew_id: rank.profile.crew_id,
      from_role: 'ground',
      body: text.slice(0, 1000),
      deliver_at: delay > 0 ? deliver.toISOString() : null,
    })
    setBody('')
    setSentInfo(t('ground.sent', { s: Math.round(delay) }))
  }

  return (
    <form
      className="detail__block composer"
      onSubmit={(e) => {
        e.preventDefault()
        void send()
      }}
    >
      <h3>{t('ground.compose', { name: rank.profile.name })}</h3>
      {sugKey && rank.worstSystem && (
        <p className="composer__hint muted">💡 {t('ground.suggested', { system: t(`system.${rank.worstSystem}`) })}</p>
      )}
      <label className="sr-only" htmlFor="composer-body">
        {t('ground.compose', { name: rank.profile.name })}
      </label>
      <textarea
        id="composer-body"
        rows={4}
        maxLength={1000}
        value={body}
        placeholder={t('ground.placeholder')}
        onChange={(e) => {
          setBody(e.target.value)
          setSentInfo(null)
        }}
      />

      <div className="composer__opts">
        <label>
          {t('ground.scenario')}{' '}
          <select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)}>
            <option value="iss">{t('delay.iss')}</option>
            <option value="moon">{t('delay.moon')}</option>
            <option value="mars">{t('delay.mars')}</option>
          </select>
        </label>
        {scenario === 'mars' && (
          <label>
            {t('ground.mars_minutes', { m: marsMinutes })}
            <input
              type="range"
              min={MARS_MINUTES_MIN}
              max={MARS_MINUTES_MAX}
              value={marsMinutes}
              onChange={(e) => setMarsMinutes(Number(e.target.value))}
            />
          </label>
        )}
        {scenario === 'mars' && (
          <label className="check">
            <input type="checkbox" checked={accelerated} onChange={(e) => setAccelerated(e.target.checked)} />{' '}
            {t('ground.accelerated')}
          </label>
        )}
      </div>

      <div className="composer__send">
        <button type="submit" className="btn btn--primary" disabled={!body.trim()}>
          {t('ground.send')} ▶
        </button>
        {sentInfo && (
          <span role="status" className="muted">
            ✓ {sentInfo}
          </span>
        )}
      </div>
    </form>
  )
}
