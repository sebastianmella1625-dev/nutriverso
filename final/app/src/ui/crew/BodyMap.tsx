import type { KeyboardEvent } from 'react'
import type { SystemId, SystemState } from '../../domain/systems'
import { useT } from '../../i18n'
import { STATUS_ICON } from '../StatusBadge'

// D-30: astronauta con traje. Zonas: casco = mente, pecho = corazón, abdomen = inmune, brazos = músculo, piernas = hueso.

interface Props {
  bySystem: Record<SystemId, SystemState>
  selected: SystemId | null
  onSelect: (s: SystemId) => void
}

/** Formas SVG de cada zona (viewBox 0 0 200 330) y el punto donde va su ícono de estado. */
const ZONES: Record<SystemId, { shapes: string[]; icon: [number, number] }> = {
  mind: { shapes: ['M100 14 a38 38 0 1 1 -0.1 0 Z'], icon: [100, 74] },
  heart: { shapes: ['M62 98 h76 a10 10 0 0 1 10 10 v52 h-96 v-52 a10 10 0 0 1 10 -10 Z'], icon: [100, 130] },
  immune: { shapes: ['M52 162 h96 v44 a12 12 0 0 1 -12 12 h-72 a12 12 0 0 1 -12 -12 Z'], icon: [100, 190] },
  muscle: {
    shapes: [
      'M28 104 a14 14 0 0 1 22 -6 v104 a14 14 0 0 1 -28 0 v-86 a14 14 0 0 1 6 -12 Z',
      'M172 104 a14 14 0 0 0 -22 -6 v104 a14 14 0 0 0 28 0 v-86 a14 14 0 0 0 -6 -12 Z',
    ],
    icon: [36, 150],
  },
  bone: {
    shapes: [
      'M62 222 h34 v88 a10 10 0 0 1 -10 10 h-14 a10 10 0 0 1 -10 -10 Z',
      'M104 222 h34 v88 a10 10 0 0 1 -10 10 h-14 a10 10 0 0 1 -10 -10 Z',
    ],
    icon: [79, 270],
  },
}

/** Rectángulos táctiles transparentes por zona (no se dibujan; solo reciben el toque). */
const HIT: Record<SystemId, { x: number; y: number; width: number; height: number }> = {
  mind: { x: 62, y: 14, width: 76, height: 78 },
  heart: { x: 52, y: 98, width: 96, height: 62 },
  immune: { x: 52, y: 162, width: 96, height: 56 },
  muscle: { x: 22, y: 98, width: 28, height: 118 }, // brazo izquierdo; el derecho es su propio path
  bone: { x: 62, y: 222, width: 76, height: 98 },
}

export function BodyMap({ bySystem, selected, onSelect }: Props) {
  const { t } = useT()
  const order: SystemId[] = ['mind', 'heart', 'immune', 'muscle', 'bone']

  const onKey = (s: SystemId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(s)
    }
  }

  return (
    <div className="bodymap">
      <svg viewBox="0 0 200 330" className="bodymap__svg" role="group" aria-label={t('crew.body_map')}>
        {order.map((s) => {
          const st = bySystem[s].status
          return (
            <g
              key={s}
              role="button"
              tabIndex={0}
              aria-pressed={selected === s}
              aria-label={`${t(`system.${s}`)}: ${t(`status.${st}`)}`}
              className={`zone zone--${st}${selected === s ? ' zone--selected' : ''}`}
              onClick={() => onSelect(s)}
              onKeyDown={onKey(s)}
            >
              {/* área táctil completa (cubre huecos entre piernas o brazos) */}
              <rect {...HIT[s]} className="zone__hit" />
              {ZONES[s].shapes.map((d, i) => (
                <path key={i} d={d} />
              ))}
              <text x={ZONES[s].icon[0]} y={ZONES[s].icon[1]} className="zone__icon" aria-hidden="true">
                {STATUS_ICON[st]}
              </text>
            </g>
          )
        })}
        {/* visor del casco (decorativo, encima de la zona mente; no captura clics) */}
        <ellipse cx="100" cy="46" rx="22" ry="12" className="bodymap__visor" aria-hidden="true" />
      </svg>

      <ul className="legend">
        {order.map((s) => {
          const { status, complete } = bySystem[s]
          return (
            <li key={s}>
              <button
                type="button"
                className={`legend__item legend__item--${status}${selected === s ? ' is-selected' : ''}`}
                onClick={() => onSelect(s)}
              >
                <span className="legend__icon" aria-hidden="true">
                  {STATUS_ICON[status]}
                </span>
                <span className="legend__name">{t(`system.${s}`)}</span>
                <span className="legend__status">
                  {t(`status.${status}`)}
                  {!complete && status !== 'nodata' ? ` · ${t('status.incomplete')}` : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
