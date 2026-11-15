import { useState } from 'react'
import { DEFAULT_ACCELERATED, DEFAULT_SCENARIO, delaySeconds, isDelivered } from '../../domain/delay'
import { buildReport } from '../../domain/report'
import type { CrewProfile, Reading } from '../../domain/types'
import type { Message, Store } from '../../data'
import { useT } from '../../i18n'

interface Props {
  profile: CrewProfile
  readings: Reading[]
  messages: Message[]
  store: Store
  now: Date
}

/** Mensajes de Tierra para un tripulante (Review Focus #4) + envío del informe semanal (F4, D-53). */
export function Inbox({ profile, readings, messages, store, now }: Props) {
  const { t, lang } = useT()
  const [sentInfo, setSentInfo] = useState<string | null>(null)
  const crewId = profile.crew_id
  const mine = messages
    .filter((m) => m.crew_id === crewId && m.from_role === 'ground')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const sendReport = async () => {
    const delay = delaySeconds(DEFAULT_SCENARIO, { accelerated: DEFAULT_ACCELERATED })
    await store.sendMessage({
      crew_id: crewId,
      from_role: 'crew',
      body: buildReport(readings, profile, new Date()),
      deliver_at: new Date(Date.now() + delay * 1000).toISOString(),
    })
    setSentInfo(t('crew.report.sent', { s: Math.round(delay) }))
  }

  return (
    <section className="inbox" aria-labelledby="inbox-title">
      <div className="report-box">
        <button type="button" className="btn btn--primary" onClick={() => void sendReport()}>
          🗒 {t('crew.report.send')}
        </button>
        <p className="muted report-box__hint">{t('crew.report.hint')}</p>
        {sentInfo && (
          <p role="status" className="report-box__sent">
            ✓ {sentInfo}
          </p>
        )}
      </div>

      <h2 id="inbox-title">{t('crew.inbox.title')}</h2>
      {mine.length === 0 && <p className="muted">{t('crew.inbox.empty')}</p>}
      <ul className="msglist" aria-live="polite">
        {mine.map((m) => {
          const delivered = isDelivered(m, now)
          const secs = m.deliver_at ? Math.max(0, Math.ceil((new Date(m.deliver_at).getTime() - now.getTime()) / 1000)) : 0
          return (
            <li key={m.id} className={`msg${delivered ? '' : ' msg--transit'}`}>
              {delivered ? (
                <>
                  <p className="msg__body">{m.body}</p>
                  <time className="msg__time" dateTime={m.deliver_at ?? m.created_at}>
                    {new Date(m.deliver_at ?? m.created_at).toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </time>
                </>
              ) : (
                <p className="msg__transit">📡 {t('crew.inbox.in_transit', { s: secs })}</p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
