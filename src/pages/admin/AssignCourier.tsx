import { motion, useReducedMotion } from 'framer-motion'
import { Info, Send } from 'lucide-react'
import { useState } from 'react'
import { BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockAssignableClaims, getMockCouriers } from '../../data/mock/admin'
import { cn } from '../../lib/cn'
import { describeExpiry, formatAgo } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import type { AssignableClaim } from '../../types/admin'
import { Route } from '../courier/Route'
import { AdminIntro } from './kit'
import { PROTOTYPE_NOTE, pad2 } from './presentation'
import './dispatch-ops.css'

export function AssignCourier() {
  const claims = getMockAssignableClaims()
  const couriers = getMockCouriers()
  const urgent = claims.filter((c) => describeExpiry(c.expiresAt).urgency === 'critical').length

  return (
    <div className="container ws-page adm">
      <AdminIntro
        code="ADM-04"
        title={
          <>
            Assign <em>courier</em>
          </>
        }
        lead="Booked claims with no courier yet, soonest to expire first. Pick a courier for each, then dispatch."
        aside={
          claims.length > 0 && (
            <dl className="readout">
              <div className={cn(urgent > 0 && 'is-warn')}>
                <dt>Closing soon</dt>
                <dd>{pad2(urgent)}</dd>
              </div>
              <div>
                <dt>Unassigned</dt>
                <dd>{pad2(claims.length)}</dd>
              </div>
            </dl>
          )
        }
        meta={['Dispatch operations', `${couriers.length} couriers on roster`, `${claims.length} awaiting dispatch`]}
      />

      {claims.length === 0 ? (
        <div className="ws-empty queue-empty">
          <h2>Nothing to dispatch.</h2>
          <p>Every booked claim already has a courier assigned. New claims appear here the moment they're booked.</p>
        </div>
      ) : (
        <ol role="list" className="dboard" aria-label="Claims awaiting a courier, soonest to expire first">
          {claims.map((c, i) => (
            <li key={c.claimId}>
              <DispatchRow claim={c} index={i} couriers={couriers} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

type RowProps = { claim: AssignableClaim; index: number; couriers: ReturnType<typeof getMockCouriers> }

function DispatchRow({ claim: c, index, couriers }: RowProps) {
  const reduced = useReducedMotion()
  const [courierId, setCourierId] = useState('')
  const [error, setError] = useState(false)
  const [assigned, setAssigned] = useState<string | null>(null)
  const expiry = describeExpiry(c.expiresAt)

  function assign() {
    if (!courierId) {
      setError(true)
      return
    }
    setError(false)
    setAssigned(courierId)
  }

  const selectId = `courier-${c.claimId}`

  return (
    <motion.article
      className={cn('dop', expiry.urgency === 'critical' && 'is-urgent')}
      aria-labelledby={`dop-title-${c.claimId}`}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: ease.out, delay: Math.min(index, 6) * 0.06 }}
    >
      <BotanicalDecoration>
        <BotanicalCorner position="top-right" className="dop__contours" />
      </BotanicalDecoration>

      <header className="dop__head">
        <div>
          <p className="dop__kicker">
            <StatusChip tone="warning">Awaiting courier</StatusChip>
            <code className="dop__ref">#{c.claimId.toUpperCase()}</code>
          </p>
          <h2 id={`dop-title-${c.claimId}`} className="dop__title">
            {c.donationTitle}
          </h2>
          <p className="dop__qty">
            {c.quantity} {c.unit}
          </p>
        </div>
        <div className={cn('dop__expiry', expiry.urgency === 'critical' && 'is-urgent')}>
          <span className="t-label">Expires</span>
          <time dateTime={c.expiresAt}>{expiry.relative}</time>
          <span className="dop__claimed">Claimed {formatAgo(c.claimedAt)}</span>
        </div>
      </header>

      <div className="dop__route">
        <Route task={{ status: c.status, donorOrganizationName: c.donorOrganizationName, pickupAddress: c.pickupAddress, beneficiaryOrganizationName: c.beneficiaryOrganizationName }} />
      </div>

      <div className="dop__dispatch">
        <div className="dop__field">
          <label htmlFor={selectId} className="dop__label">
            Courier
          </label>
          <select
            id={selectId}
            className="adm-select dop__select"
            value={courierId}
            aria-invalid={error || undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            onChange={(e) => {
              setCourierId(e.target.value)
              setError(false)
              setAssigned(null)
            }}
          >
            <option value="">Select a courier…</option>
            {couriers.map((cr) => (
              <option key={cr.userId} value={cr.userId}>
                {cr.fullName}
              </option>
            ))}
          </select>
          {error && (
            <p id={`${selectId}-error`} className="dop__error">
              Choose a courier before dispatching this claim.
            </p>
          )}
        </div>
        <Button variant="primary" size="sm" iconStart={<Send />} onClick={assign} className="dop__assign">
          Assign
        </Button>
      </div>

      <div role="status" className="dop__result">
        {assigned && (
          <p className="ws-notice">
            <Info aria-hidden="true" />
            <span>
              <strong>{PROTOTYPE_NOTE}</strong> {couriers.find((cr) => cr.userId === assigned)?.fullName} was not assigned to
              this claim.
            </span>
          </p>
        )}
      </div>
    </motion.article>
  )
}
