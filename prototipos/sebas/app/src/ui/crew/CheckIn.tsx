import { useState } from 'react'
import { checkinIndicators, needsBodyMass } from '../../domain/engagement'
import { parseValue, UNITS, validateReading } from '../../domain/thresholds'
import type { CrewProfile, Indicator, Reading } from '../../domain/types'
import type { Store } from '../../data'
import { useT } from '../../i18n'

const STEPS: { key: string; indicators: Indicator[] }[] = [
  { key: 'crew.checkin.step_vitals', indicators: ['heart_rate', 'bp_systolic', 'bp_diastolic', 'glucose', 'body_temp'] },
  { key: 'crew.checkin.step_rest', indicators: ['sleep_hours', 'mood'] },
  { key: 'crew.checkin.step_nutrition', indicators: ['water_ml', 'energy_kcal', 'protein_g', 'body_mass_kg'] },
]

interface Props {
  profile: CrewProfile
  readings: Reading[]
  store: Store
  now: Date
}

export function CheckIn({ profile, readings, store, now }: Props) {
  const { t } = useT()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Partial<Record<Indicator, string>>>({})
  const [errors, setErrors] = useState<Partial<Record<Indicator, string>>>({})
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const asked = new Set(checkinIndicators(readings, profile.crew_id, now))
  const steps = STEPS.map((s) => ({ ...s, indicators: s.indicators.filter((i) => asked.has(i)) }))
  const current = steps[step]
  const last = step === steps.length - 1

  const save = async () => {
    const errs: Partial<Record<Indicator, string>> = {}
    const parsed: { ind: Indicator; value: number }[] = []
    for (const [ind, raw] of Object.entries(values) as [Indicator, string][]) {
      if (!raw?.trim()) continue
      const v = parseValue(raw)
      const check = v === null ? { ok: false as const, reason: 'validation.not_a_number' } : validateReading(ind, v)
      if (!check.ok) errs[ind] = check.reason
      else parsed.push({ ind, value: v as number })
    }
    setErrors(errs)
    const firstBad = steps.findIndex((s) => s.indicators.some((i) => errs[i]))
    if (firstBad >= 0) {
      setStep(firstBad)
      setMsg({ kind: 'error', text: t('crew.checkin.fix_errors') })
      return
    }
    if (parsed.length === 0) {
      setMsg({ kind: 'error', text: t('crew.checkin.empty') })
      return
    }
    const at = new Date().toISOString()
    await store.addReadings(
      parsed.map(({ ind, value }) => ({
        crew_id: profile.crew_id,
        indicator: ind,
        value,
        unit: UNITS[ind],
        measured_at: at,
        source: 'simulated',
      })),
    )
    setValues({})
    setStep(0)
    setMsg({ kind: 'ok', text: `✓ ${t('crew.checkin.saved')}` })
  }

  return (
    <section className="checkin" aria-labelledby="checkin-title">
      <h2 id="checkin-title">{t('crew.checkin.title')}</h2>
      <ol className="steps" aria-label={t('crew.checkin.title')}>
        {steps.map((s, i) => (
          <li key={s.key} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            {t(s.key)}
          </li>
        ))}
      </ol>

      {step === 2 && needsBodyMass(readings, profile.crew_id, now) && (
        <p className="note">⚖ {t('crew.checkin.weekly_mass')}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (last) void save()
          else setStep(step + 1)
        }}
      >
        {current.indicators.map((ind) => (
          <label key={ind} className={`field${errors[ind] ? ' field--error' : ''}`}>
            <span className="field__label">
              {t(`indicator.${ind}`)} <span className="field__unit">({UNITS[ind]})</span>
            </span>
            <input
              inputMode="decimal"
              autoComplete="off"
              value={values[ind] ?? ''}
              aria-invalid={Boolean(errors[ind])}
              aria-describedby={errors[ind] ? `err-${ind}` : undefined}
              onChange={(e) => {
                setValues({ ...values, [ind]: e.target.value })
                setMsg(null)
              }}
            />
            {errors[ind] && (
              <span id={`err-${ind}`} className="field__error">
                {t(errors[ind] as string)}
              </span>
            )}
          </label>
        ))}

        <div className="checkin__nav">
          {step > 0 && (
            <button type="button" className="btn" onClick={() => setStep(step - 1)}>
              {t('crew.checkin.back')}
            </button>
          )}
          <button type="submit" className="btn btn--primary">
            {last ? t('crew.checkin.save') : t('crew.checkin.next')}
          </button>
        </div>
        {msg && (
          <p role="status" className={`checkin__msg checkin__msg--${msg.kind}`}>
            {msg.text}
          </p>
        )}
      </form>
    </section>
  )
}
