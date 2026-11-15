import { useEffect, useState } from 'react'
import { SW_TYPES } from '../domain/spaceWeather'
import { loadSpaceWeather, type SwState } from '../data/spaceWeatherStore'
import { useT } from '../i18n'

const API_KEY = (import.meta.env.VITE_NASA_API_KEY as string | undefined)?.trim() || 'DEMO_KEY'

const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* sin storage: no se guarda caché */
    }
  },
}

/** Consulta al montar y cada 5 min (la caché limita a 1 llamada real cada 30 min). */
function useSpaceWeather(): SwState & { loading: boolean } {
  const [st, setSt] = useState<SwState & { loading: boolean }>({ data: null, status: 'unavailable', loading: true })
  useEffect(() => {
    let alive = true
    const run = () =>
      loadSpaceWeather({ now: new Date(), apiKey: API_KEY, fetchFn: (...a) => fetch(...a), storage: safeStorage }).then(
        (r) => alive && setSt({ ...r, loading: false }),
      )
    void run()
    const id = setInterval(run, 5 * 60e3)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])
  return st
}

export function SpaceWeatherCard() {
  const { t, lang } = useT()
  const { data, status, loading } = useSpaceWeather()
  const hhmm = (iso: string) => new Date(iso).toLocaleTimeString(lang === 'es' ? 'es-CL' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  const active = data ? SW_TYPES.filter((ty) => data.counts[ty] > 0) : []

  return (
    <section className={`sw${data?.sep ? ' sw--sep' : ''}`} aria-labelledby="sw-title">
      <h2 id="sw-title" className="sw__title">
        🛰 {t('sw.title')}
      </h2>
      {loading && <p className="muted">{t('sw.loading')}</p>}
      {!loading && !data && <p className="muted">{t('sw.unavailable')}</p>}
      {data && (
        <>
          {data.sep && (
            <p className="sw__sep" role="alert">
              ☢ {t('sw.sep')}
            </p>
          )}
          {active.length === 0 ? (
            <p>{t('sw.calm')}</p>
          ) : (
            <ul className="sw__counts">
              {active.map((ty) => (
                <li key={ty} title={t(`sw.type.${ty}`)}>
                  <strong>{ty}</strong> {t(`sw.type.${ty}`)} · {data.counts[ty]}
                </li>
              ))}
            </ul>
          )}
          {data.last && (
            <p className="sw__last">
              {t('sw.last', { type: data.last.type, time: data.last.time })}{' '}
              {data.last.url && (
                <a href={data.last.url} target="_blank" rel="noreferrer">
                  NASA ↗
                </a>
              )}
            </p>
          )}
          <p className="sw__meta muted">
            {status === 'cached' ? t('sw.cached', { t: hhmm(data.fetchedAt) }) : t('sw.updated', { t: hhmm(data.fetchedAt) })}
          </p>
        </>
      )}
    </section>
  )
}
