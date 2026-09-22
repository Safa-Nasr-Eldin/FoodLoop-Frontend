import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CircleCheckBig, CircleDashed, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PATHS, verifyHandoverPath } from '../../app/routes'
import { CATEGORY_META, formatQuantity } from '../../components/food/presentation'
import { CLAIM_STATUS_META, NEXT_STEP_META, refOf } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockCourierTaskById } from '../../data/mock/courier'
import { cn } from '../../lib/cn'
import { describeExpiry, formatAbsolute, formatAgo } from '../../lib/expiry'
import { ease, revealVariants, staggerVariants } from '../../lib/motion'
import type { HandoverType } from '../../types/handover'
import { Route } from './Route'
import './courier.css'

const STAGES: HandoverType[] = ['Pickup', 'Delivery']

export function TaskDetails() {
  const { id = '' } = useParams()
  const reduced = useReducedMotion()
  const task = getMockCourierTaskById(id)

  if (!task) return <MissingTask />

  const t = task
  const status = CLAIM_STATUS_META[t.status]
  const step = NEXT_STEP_META[t.nextStep]
  const expiry = describeExpiry(t.expiresAt)
  const done = step.lane === 'done'
  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: ease.out, delay },
  })

  return (
    <div className="container ws-page task">
      <Link to={PATHS.courierTasks} className="ws-back">
        <ArrowLeft aria-hidden="true" />
        My tasks
      </Link>

      <header className="task__head">
        <p className="task__kicker t-label">
          Dispatch ticket <span className="t-data">{refOf(t.id)}</span> · assigned {formatAgo(t.assignedAt).toLowerCase()}
        </p>
        <h1 className="task__title">{t.donationTitle}</h1>
        <div className="task__status">
          <StatusChip tone={status.tone}>{status.label}</StatusChip>
          <span className="task__meta">
            {formatQuantity(t)} · {CATEGORY_META[t.category].label}
          </span>
        </div>
      </header>

      <div className="task__grid">
        <motion.section className="task__route on-dark grain" aria-labelledby="route-title" {...enter(0.1)}>
          <h2 id="route-title" className="task__panel-title t-label">
            Route
          </h2>
          <Route task={t} size="large" />
          <div className="dispatch__tear task__tear" aria-hidden="true" />
          <dl className="task__facts">
            <div>
              <dt>Quantity</dt>
              <dd className="t-data">{formatQuantity(t)}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>
                {!done && <span className={cn('task__expiry', expiry.urgency === 'critical' && 'is-urgent')}>{expiry.relative}</span>}
                <time dateTime={t.expiresAt}>{expiry.absolute}</time>
              </dd>
            </div>
            <div>
              <dt>Assigned</dt>
              <dd>
                <time dateTime={t.assignedAt}>{formatAbsolute(t.assignedAt)}</time>
              </dd>
            </div>
          </dl>
        </motion.section>

        <div className="task__side">
          <motion.section className={cn('next-step', done && 'next-step--done')} aria-labelledby="next-title" {...enter(0.2)}>
            <h2 id="next-title" className="next-step__kicker t-label">
              Next step
            </h2>
            <p className="next-step__label">
              {done && <CircleCheckBig aria-hidden="true" />}
              {step.label}
            </p>
            <p className="next-step__detail">{step.detail}</p>
            {step.verify && step.action && (
              <Button
                size="lg"
                variant={t.nextStep === 'ProceedToBeneficiary' ? 'outline' : 'primary'}
                to={verifyHandoverPath(t.id)}
                iconEnd={<ArrowRight />}
                className="next-step__action"
              >
                {step.action}
              </Button>
            )}
          </motion.section>

          <section className="evidence" aria-labelledby="evidence-title">
            <h2 id="evidence-title" className="evidence__title">
              Handover evidence
            </h2>
            <motion.ul
              role="list"
              className="evidence__list"
              variants={staggerVariants}
              initial={reduced ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true }}
            >
              {STAGES.map((type) => {
                const ev = t.evidence.find((e) => e.type === type)
                return (
                  <motion.li key={type} className={cn('evidence__item', ev && 'is-verified')} variants={revealVariants}>
                    <span className="evidence__icon" aria-hidden="true">
                      {ev ? <ShieldCheck /> : <CircleDashed />}
                    </span>
                    <span className="evidence__text">
                      <span className="evidence__label">{ev ? `${type} Evidence Verified` : `${type} evidence`}</span>
                      {ev ? (
                        <time className="evidence__state" dateTime={ev.verifiedAt}>
                          {formatAbsolute(ev.verifiedAt)}
                        </time>
                      ) : (
                        <span className="evidence__state">Not yet recorded</span>
                      )}
                    </span>
                  </motion.li>
                )
              })}
            </motion.ul>
          </section>
        </div>
      </div>
    </div>
  )
}

function MissingTask() {
  return (
    <div className="container ws-page">
      <div className="ws-empty">
        <h1 className="t-h2">This task isn’t on your board.</h1>
        <p>It may have been reassigned, or the link is incomplete.</p>
        <Button to={PATHS.courierTasks} iconStart={<ArrowLeft />}>
          Back to my tasks
        </Button>
      </div>
    </div>
  )
}
