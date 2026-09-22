import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Building2, Info, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PATHS } from '../../app/routes'
import { BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { CATEGORY_META, formatQuantity } from '../../components/food/presentation'
import { CLAIM_STATUS_META, refOf } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockClaimById } from '../../data/mock/claims'
import { describeExpiry, formatAbsolute, formatAgo } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import { ClaimJourney } from './ClaimJourney'
import { EventTimeline } from './EventTimeline'
import './claims.css'

export function ClaimDetails() {
  const { id = '' } = useParams()
  const reduced = useReducedMotion()
  const [cancelNote, setCancelNote] = useState(false)
  const claim = getMockClaimById(id)

  if (!claim) return <MissingClaim />

  const c = claim
  const status = CLAIM_STATUS_META[c.status]
  const expiry = describeExpiry(c.expiresAt)
  const enter = (delay: number, x = 0) => ({
    initial: reduced ? false : { opacity: 0, y: x ? 0 : 18, x },
    animate: { opacity: 1, y: 0, x: 0 },
    transition: { duration: 0.65, ease: ease.out, delay },
  })

  return (
    <div className="container ws-page claim">
      <Link to={PATHS.claims} className="ws-back">
        <ArrowLeft aria-hidden="true" />
        My claims
      </Link>

      <div className="claim__grid">
        <motion.section className="claim__identity" aria-labelledby="claim-title" {...enter(0.05)}>
          <p className="claim__kicker t-label">
            Claim <span className="t-data">{refOf(c.id)}</span> · {CATEGORY_META[c.category].label}
          </p>
          <h1 id="claim-title" className="claim__title">
            {c.donationTitle}
          </h1>
          <p className="claim__org">
            <Building2 aria-hidden="true" />
            <span>
              Donated by <strong>{c.donorOrganizationName}</strong>
            </span>
          </p>
          <div className="claim__status">
            <StatusChip tone={status.tone}>{status.label}</StatusChip>
            <span className="claim__updated">
              Claimed <time dateTime={c.claimedAt}>{formatAgo(c.claimedAt).toLowerCase()}</time>
            </span>
          </div>

          <h2 className="visually-hidden">Claim summary</h2>
          <dl className="claim__summary">
            <div>
              <dt>Quantity</dt>
              <dd className="t-data">{formatQuantity(c)}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>
                {status.phase === 'active' && <span className="claim__expiry-rel">{expiry.relative}</span>}
                <time dateTime={c.expiresAt}>{expiry.absolute}</time>
              </dd>
            </div>
            <div className="is-wide">
              <dt>Pickup location</dt>
              <dd className="claim__address">
                <MapPin aria-hidden="true" />
                {c.pickupAddress}
              </dd>
            </div>
            <div className="is-wide">
              <dt>Receiving organization</dt>
              <dd>{c.beneficiaryOrganizationName}</dd>
            </div>
            <div className="is-wide">
              <dt>Claimed on</dt>
              <dd>
                <time dateTime={c.claimedAt}>{formatAbsolute(c.claimedAt)}</time>
              </dd>
            </div>
          </dl>

          {c.canCancel && (
            <div className="claim__actions">
              <Button variant="outline" onClick={() => setCancelNote(true)}>
                Cancel claim
              </Button>
              <div role="status" className="claim__status-slot">
                {cancelNote && (
                  <p className="ws-notice">
                    <Info aria-hidden="true" />
                    Prototype only — no request was sent. This claim and its journey are unchanged.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.section>

        <motion.section className="claim__stage on-dark grain" aria-labelledby="journey-title" {...enter(0.2, 28)}>
          <BotanicalDecoration>
            <BotanicalCorner position="bottom-right" className="claim__contours" />
          </BotanicalDecoration>
          <h2 id="journey-title" className="claim__stage-title t-label">
            Claim journey
          </h2>
          <ClaimJourney claim={c} />
        </motion.section>
      </div>

      <section className="claim__history" aria-labelledby="history-title">
        <div className="claim__history-head">
          <h2 id="history-title" className="claim__history-title">
            Event <em>history</em>
          </h2>
          <p className="claim__history-note">
            {c.events.length} recorded {c.events.length === 1 ? 'event' : 'events'}, oldest first. Only transitions that have
            happened appear here.
          </p>
        </div>
        <EventTimeline events={c.events} />
      </section>
    </div>
  )
}

function MissingClaim() {
  return (
    <div className="container ws-page">
      <div className="ws-empty">
        <h1 className="t-h2">This claim isn’t on record.</h1>
        <p>The link may be incomplete. Your current claims are listed on My claims.</p>
        <Button to={PATHS.claims} iconStart={<ArrowLeft />}>
          Back to my claims
        </Button>
      </div>
    </div>
  )
}
