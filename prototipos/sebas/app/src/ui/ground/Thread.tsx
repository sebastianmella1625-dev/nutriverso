import { isDelivered } from '../../domain/delay'
import type { Message } from '../../data'
import { useT } from '../../i18n'

const secsTo = (iso: string | null, now: Date) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 1000)) : 0

/** Conversación en ambos sentidos, vista desde Tierra. Los avisos del crew en viaje no muestran su contenido. */
export function Thread({ crewId, messages, now }: { crewId: string; messages: Message[]; now: Date }) {
  const { t } = useT()
  const thread = messages.filter((m) => m.crew_id === crewId).sort((a, b) => a.created_at.localeCompare(b.created_at))

  return (
    <div className="detail__block">
      <h3>{t('ground.thread')}</h3>
      {thread.length === 0 && <p className="muted">{t('ground.no_messages')}</p>}
      <ul className="thread" aria-live="polite">
        {thread.map((m) => {
          const delivered = isDelivered(m, now)
          if (m.from_role === 'crew') {
            return (
              <li key={m.id} className="bubble bubble--crew">
                {delivered ? m.body : <span className="muted">📡 {t('ground.incoming', { s: secsTo(m.deliver_at, now) })}</span>}
              </li>
            )
          }
          return (
            <li key={m.id} className="bubble bubble--ground">
              <span className="bubble__who">{t('ground.you')}</span>
              {m.body}
              <span className="bubble__meta">
                {delivered ? `✓ ${t('ground.delivered')}` : `📡 ${t('ground.arrives', { s: secsTo(m.deliver_at, now) })}`}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
