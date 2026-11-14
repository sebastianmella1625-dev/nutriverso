import { isDelivered } from '../../domain/delay'
import type { Message } from '../../data'
import { useT } from '../../i18n'

/** Mensajes de Tierra para un tripulante. Si aún viajan, solo se ve la cuenta regresiva (Review Focus #4). */
export function Inbox({ crewId, messages, now }: { crewId: string; messages: Message[]; now: Date }) {
  const { t, lang } = useT()
  const mine = messages
    .filter((m) => m.crew_id === crewId && m.from_role === 'ground')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <section className="inbox" aria-labelledby="inbox-title">
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
