import { useEffect, useState } from 'react'
import { CREW } from './domain/mission'
import { useMission } from './data/useMission'
import { I18nProvider, useT } from './i18n'
import { CrewView } from './ui/crew/CrewView'
import { GroundView } from './ui/ground/GroundView'
import { useNow } from './ui/useNow'
import { routeFromHash, type Route } from './routing'


function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

function Shell() {
  const { t, lang, setLang } = useT()
  const route = useRoute()
  const now = useNow(1000)
  const { store, readings, messages, error, loaded } = useMission()
  const [crewId, setCrewId] = useState(CREW[0].crew_id)
  const [confirmReset, setConfirmReset] = useState(false)
  const profile = CREW.find((c) => c.crew_id === crewId) ?? CREW[0]

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <img src="./icon-192.png" alt="" width={28} height={28} />
          <strong>NutriVerso</strong>
        </div>
        <nav className="topbar__nav" aria-label="Views">
          <a href="#/crew" aria-current={route === 'crew' ? 'page' : undefined}>{t('nav.crew')}</a>
          <a href="#/ground" aria-current={route === 'ground' ? 'page' : undefined}>{t('nav.ground')}</a>
        </nav>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} lang={lang === 'en' ? 'es' : 'en'}>
          {t('app.language')}
        </button>
      </header>

      <div className="subbar">
        <span className="mode">{store.room ? t('app.mode_room', { room: store.room }) : t('app.mode_local')}</span>
        {route === 'crew' && (
          <label className="crewpick">
            <span className="sr-only">{t('crew.select')}</span>
            <select value={crewId} onChange={(e) => setCrewId(e.target.value)} aria-label={t('crew.select')}>
              {CREW.map((c) => (
                <option key={c.crew_id} value={c.crew_id}>
                  {c.name} · {c.crew_id}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && <p className="banner banner--error" role="alert">{t('app.data_error', { error })}</p>}

      <main className="content">
        {!loaded ? null : route === 'crew' ? (
          <CrewView profile={profile} readings={readings} messages={messages} store={store} now={now} />
        ) : (
          <GroundView readings={readings} messages={messages} store={store} now={now} />
        )}
      </main>

      <footer className="footer">
        <p>⚠ {t('app.simulated')}</p>
        <p>
          <a href="https://www.nasa.gov/hrp/" target="_blank" rel="noreferrer">{t('app.source')} ↗</a>
        </p>
        {store.canReset && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={async () => {
              if (!confirmReset) return setConfirmReset(true)
              await store.reset()
              setConfirmReset(false)
            }}
            onBlur={() => setConfirmReset(false)}
          >
            ↺ {confirmReset ? t('app.reset_confirm') : t('app.reset')}
          </button>
        )}
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  )
}
