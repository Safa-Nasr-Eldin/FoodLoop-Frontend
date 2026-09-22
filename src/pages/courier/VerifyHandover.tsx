import { AlertCircle, ArrowLeft, Info, ShieldCheck } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PATHS, courierTaskPath } from '../../app/routes'
import { NEXT_STEP_META, refOf } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { getMockCourierTaskById } from '../../data/mock/courier'
import { cn } from '../../lib/cn'
import type { HandoverType } from '../../types/handover'
import './courier.css'

const CODE_LENGTH = 64
const STAGES: HandoverType[] = ['Pickup', 'Delivery']

/** Focus mode. Submitting only checks the field is filled — nothing is sent, and the task never changes. */
export function VerifyHandover() {
  const { id = '' } = useParams()
  const task = getMockCourierTaskById(id)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)

  if (!task) {
    return (
      <div className="verify on-dark grain">
        <div className="container verify__inner">
          <div className="verify__panel">
            <h1 className="verify__title">This task isn’t on your board.</h1>
            <Button variant="on-dark" to={PATHS.courierTasks} iconStart={<ArrowLeft />}>
              Back to my tasks
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const stage = NEXT_STEP_META[task.nextStep].verify
  const holder = stage === 'Pickup' ? 'donor' : 'beneficiary'
  const length = code.replace(/\s/g, '').length

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim()) {
      setError('Enter the handover code to continue.')
      setSubmitted(false)
      input.current?.focus()
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <div className="verify on-dark grain">
      <div className="container verify__inner">
        <Link to={courierTaskPath(task.id)} className="ws-back verify__back">
          <ArrowLeft aria-hidden="true" />
          Task <span className="t-data">{refOf(task.id)}</span>
        </Link>

        <div className="verify__panel">
          <p className="verify__context">
            <strong>{task.donationTitle}</strong>
            <span>
              {task.donorOrganizationName} → {task.beneficiaryOrganizationName}
            </span>
          </p>

          {stage ? (
            <>
              <ol role="list" className="verify__stages" aria-label="Handover stages">
                {STAGES.map((s) => (
                  <li key={s} className={cn('verify__stage', s === stage && 'is-current')} aria-current={s === stage ? 'step' : undefined}>
                    {s}
                  </li>
                ))}
              </ol>

              <h1 className="verify__title">Verify {stage.toLowerCase()}</h1>

              <form className="verify__form" noValidate onSubmit={submit}>
                <label htmlFor="handover-code" className="verify__label">
                  {stage} handover code
                </label>
                <p id="handover-code-hint" className="verify__hint">
                  Paste or type the code the {holder} shows you. Spaces are fine.
                </p>
                <textarea
                  ref={input}
                  id="handover-code"
                  name="handover-code"
                  className="verify__input"
                  rows={3}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setSubmitted(false)
                    if (error) setError('')
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={cn('handover-code-hint', error && 'handover-code-error')}
                />
                {/* Presentation only: the counter never validates or blocks submission. */}
                <p className="verify__counter t-data" aria-hidden="true">
                  {length} / {CODE_LENGTH}
                </p>
                {error && (
                  <p id="handover-code-error" className="verify__error">
                    <AlertCircle aria-hidden="true" />
                    {error}
                  </p>
                )}
                <Button type="submit" variant="on-dark" size="lg" iconStart={<ShieldCheck />} className="verify__submit">
                  Verify {stage.toLowerCase()}
                </Button>
              </form>

              <div role="status" className="verify__result">
                {submitted && (
                  <p className="ws-notice">
                    <Info aria-hidden="true" />
                    Prototype only — no handover was submitted. The code wasn’t checked, and this task’s status and
                    evidence are unchanged.
                  </p>
                )}
              </div>

              <p className="verify__note">
                When this is connected, FoodLoop checks the code and records the {stage.toLowerCase()} evidence for this
                task.
              </p>
            </>
          ) : (
            <>
              <h1 className="verify__title">Nothing to verify</h1>
              <p className="verify__hint">Pickup and delivery evidence are both recorded for this task.</p>
              <Button variant="on-dark" to={courierTaskPath(task.id)} iconStart={<ArrowLeft />}>
                Back to the task
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
