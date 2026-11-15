import { useState } from 'react'
import { badges, streak } from '../../domain/engagement'
import { crewSeverity, evalContext, freshLatest, type SystemId } from '../../domain/systems'
import type { CrewProfile, Reading } from '../../domain/types'
import type { Message, Store } from '../../data'
import { useT } from '../../i18n'
import { BodyMap } from './BodyMap'
import { CheckIn } from './CheckIn'
import { Inbox } from './Inbox'
import { SystemDetail } from './SystemDetail'

type Tab = 'body' | 'checkin' | 'messages'

interface Props {
  profile: CrewProfile
  readings: Reading[]
  messages: Message[]
  store: Store
  now: Date
}

export function CrewView({ profile, readings, messages, store, now }: Props) {
  const { t } = useT()
  const [tab, setTab] = useState<Tab>('body')
  const [selected, setSelected] = useState<SystemId | null>(null)

  const sev = crewSeverity(readings, profile, now)
  const latest = freshLatest(readings, profile.crew_id, now)
  const ctx = evalContext(readings, profile, now)
  const days = streak(readings, profile.crew_id, now)
  const earned = badges(readings, profile, now)
  const unread = messages.filter((m) => m.crew_id === profile.crew_id && m.from_role === 'ground').length

  return (
    <div className="crew">
      <div className="crew__main">
        {tab === 'body' && (
          <>
            <div className="engagement">
              <span className="streak">🔥 {t('crew.streak', { n: days })}</span>
              <ul className="badges" aria-label={t('crew.badges')}>
                {(['first_week', 'hydration_5', 'sleep_5'] as const).map((b) => (
                  <li key={b} className={earned[b] ? 'is-earned' : 'is-locked'}>
                    {earned[b] ? '🏅' : '🔒'} {t(`badge.${b}`)}
                    {!earned[b] && <span className="sr-only"> ({t('badge.locked')})</span>}
                  </li>
                ))}
              </ul>
            </div>
            <BodyMap bySystem={sev.bySystem} selected={selected} onSelect={setSelected} />
            {selected ? (
              <SystemDetail
                key={`${profile.crew_id}-${selected}`}
                system={selected}
                state={sev.bySystem[selected]}
                profile={profile}
                readings={readings}
                latest={latest}
                ctx={ctx}
                store={store}
                now={now}
              />
            ) : (
              <p className="muted center">{t('crew.detail.tap_hint')}</p>
            )}
          </>
        )}
        {tab === 'checkin' && <CheckIn key={profile.crew_id} profile={profile} readings={readings} store={store} now={now} />}
        {tab === 'messages' && <Inbox crewId={profile.crew_id} messages={messages} now={now} />}
      </div>

      <nav className="tabbar" aria-label="Crew">
        {(['body', 'checkin', 'messages'] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={`tabbar__btn${tab === k ? ' is-active' : ''}`}
            aria-current={tab === k ? 'page' : undefined}
            onClick={() => setTab(k)}
          >
            <span aria-hidden="true">{k === 'body' ? '🧑‍🚀' : k === 'checkin' ? '📝' : '📡'}</span>
            {t(`crew.tab.${k}`)}
            {k === 'messages' && unread > 0 && <span className="tabbar__count">{unread}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
