import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Info } from 'lucide-react'
import { useState } from 'react'
import { claimPath } from '../../app/routes'
import { BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { formatQuantity } from '../../components/food/presentation'
import { CLAIM_STATUS_META, JOURNEY_STAGES, journeyOf, refOf, type ClaimPhase } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockClaims } from '../../data/mock/claims'
import { cn } from '../../lib/cn'
import { describeExpiry, formatAgo } from '../../lib/expiry'
import { duration, ease, spring } from '../../lib/motion'
import type { Claim } from '../../types/claim'
import { ClaimJourney } from './ClaimJourney'
import './claims.css'

type View = 'all' | ClaimPhase

const VIEWS: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Completed' },
  { id: 'ended', label: 'Cancelled & failed' },
]

const phaseOf = (c: Claim) => CLAIM_STATUS_META[c.status].phase

export function MyClaims() {
  const reduced = useReducedMotion()
  const claims = getMockClaims()
  const [view, setView] = useState<View>('all')

  const inView = (v: View) => (v === 'all' ? claims : claims.filter((c) => phaseOf(c) === v))
  const visible = inView(view)
  const active = inView('active')
  // Where each active claim currently sits on the journey — straight from its recorded events.
  const atStage = JOURNEY_STAGES.map((_, i) => active.filter((c) => journeyOf(c).lastReached === i))

  return (
    <div className="container ws-page claims">
      <header className="claims-intro">
        <div className="claims-intro__text">
          <SectionEyebrow>Beneficiary workspace</SectionEyebrow>
          <h1 className="ws-intro__title">
            My <em>claims</em>
          </h1>
          <p className="t-lead ws-intro__lead">Food you’ve claimed, where it is on its way to you, and what already arrived.</p>
        </div>

        {/* ---- Pulse: every number is counted from the claims below ---- */}
        <section className="claims-pulse on-dark grain" aria-labelledby="pulse-title">
          <BotanicalDecoration>
            <BotanicalCorner position="top-right" className="claims-pulse__contours" />
          </BotanicalDecoration>
          <h2 id="pulse-title" className="claims-pulse__title t-label">
            Claims at a glance
          </h2>
          <dl className="claims-pulse__totals">
            <div className="is-primary">
              <dt>Active</dt>
              <dd className="t-data">{active.length}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd className="t-data">{claims.length}</dd>
            </div>
            <div>
              <dt>Delivered or closed</dt>
              <dd className="t-data">{inView('done').length}</dd>
            </div>
            <div>
              <dt>Cancelled or failed</dt>
              <dd className="t-data">{inView('ended').length}</dd>
            </div>
          </dl>
          <div className="claims-pulse__pipe">
            <p className="claims-pulse__pipe-title">Active claims by stage</p>
            <ol role="list" className="pipe">
              {JOURNEY_STAGES.map((s, i) => (
                <li key={s.status} className={cn('pipe__stage', atStage[i].length > 0 && 'is-occupied')}>
                  <span className="pipe__dots" aria-hidden="true">
                    {atStage[i].map((c) => (
                      <span key={c.id} className="pipe__dot" />
                    ))}
                  </span>
                  <span className="pipe__count t-data">{atStage[i].length}</span>
                  <span className="pipe__label">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </header>

      <section className="claims-records" aria-labelledby="records-title">
        <div className="claims-records__head">
          <h2 id="records-title" className="claims-records__title">
            Claim log
          </h2>
          <div className="claims-filter" role="group" aria-label="Filter claims">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={cn('claims-filter__btn', view === v.id && 'is-active')}
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
              >
                {view === v.id && (
                  <motion.span layoutId="claims-filter-indicator" className="claims-filter__indicator" transition={spring.indicator} />
                )}
                <span className="claims-filter__label">{v.label}</span>
                <span className="claims-filter__count t-data">{inView(v.id).length}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <ol role="list" className="claims-list">
            <AnimatePresence mode="popLayout" initial={!reduced}>
              {visible.map((c, i) => (
                <motion.li
                  key={c.id}
                  layout="position"
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: duration.fast } }}
                  transition={{ duration: 0.45, ease: ease.out, delay: Math.min(i, 10) * 0.05 }}
                >
                  <ClaimRow claim={c} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        ) : (
          <div className="ws-empty">
            <h3>Nothing in this view.</h3>
            <p>Claims move between views as they are delivered, closed or cancelled.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function ClaimRow({ claim: c }: { claim: Claim }) {
  const [cancelNote, setCancelNote] = useState(false)
  const status = CLAIM_STATUS_META[c.status]
  const expiry = describeExpiry(c.expiresAt)
  const live = status.phase === 'active'

  return (
    <article className={cn('claim-row', `claim-row--${status.phase}`)} aria-labelledby={`claim-${c.id}`}>
      <p className="claim-row__ref">
        <span className="t-data">{refOf(c.id)}</span>
        <time dateTime={c.claimedAt}>Claimed {formatAgo(c.claimedAt).toLowerCase()}</time>
      </p>

      <div className="claim-row__main">
        <h3 id={`claim-${c.id}`} className="claim-row__title">
          {c.donationTitle}
        </h3>
        <p className="claim-row__org">
          from <strong>{c.donorOrganizationName}</strong>
        </p>
        <dl className="claim-row__facts">
          <div>
            <dt>Quantity</dt>
            <dd className="t-data">{formatQuantity(c)}</dd>
          </div>
          <div>
            <dt>Expiry</dt>
            <dd>
              <time dateTime={c.expiresAt} className={cn(live && expiry.urgency === 'critical' && 'is-urgent')}>
                {live ? expiry.relative : expiry.absolute}
              </time>
            </dd>
          </div>
        </dl>
      </div>

      <div className="claim-row__journey">
        <StatusChip tone={status.tone}>{status.label}</StatusChip>
        <ClaimJourney claim={c} variant="rail" />
      </div>

      <div className="claim-row__actions">
        <Button variant={live ? 'primary' : 'outline'} size="sm" to={claimPath(c.id)} iconEnd={<ArrowRight />}>
          Details<span className="visually-hidden"> for {c.donationTitle}</span>
        </Button>
        {c.canCancel && (
          <Button variant="ghost" size="sm" onClick={() => setCancelNote(true)}>
            Cancel claim<span className="visually-hidden"> for {c.donationTitle}</span>
          </Button>
        )}
      </div>

      {c.canCancel && (
        <div role="status" className="claim-row__status">
          {cancelNote && (
            <p className="ws-notice">
              <Info aria-hidden="true" />
              Prototype only — no request was sent. This claim is unchanged.
            </p>
          )}
        </div>
      )}
    </article>
  )
}
