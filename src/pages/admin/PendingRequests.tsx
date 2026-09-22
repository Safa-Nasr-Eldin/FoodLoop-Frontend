import { motion, useReducedMotion } from 'framer-motion'
import { Check, Info, X } from 'lucide-react'
import { useState } from 'react'
import { PATHS } from '../../app/routes'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockPendingRequests } from '../../data/mock/admin'
import { cn } from '../../lib/cn'
import { formatAgo } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import type { PendingOrganizationRequest } from '../../types/admin'
import { ORGANIZATION_TYPE_LABELS } from '../../types/organization'
import { AdminIntro } from './kit'
import { PROTOTYPE_NOTE, daysSince, formatDate, formatUtc, pad2 } from './presentation'
import './review.css'

type Decision = 'Approve' | 'Reject'

const waited = (iso: string) => {
  const d = daysSince(iso)
  return d === 0 ? 'Since today' : `${d} ${d === 1 ? 'day' : 'days'}`
}

export function PendingRequests() {
  const requests = getMockPendingRequests()
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  return (
    <div className="container ws-page adm">
      <AdminIntro
        code="ADM-03"
        title={
          <>
            Pending <em>requests</em>
          </>
        }
        lead="Organizations waiting to join FoodLoop, oldest first. Check the licence and registration, then approve or reject."
        aside={
          requests.length > 0 && (
            <dl className="readout">
              <div className="is-warn">
                <dt>In queue</dt>
                <dd>{pad2(requests.length)}</dd>
              </div>
              <div>
                <dt>Oldest wait</dt>
                <dd>{daysSince(requests[0].submittedAt)}d</dd>
              </div>
            </dl>
          )
        }
        meta={['Review queue', 'First in, first reviewed', `${requests.length} awaiting decision`]}
      />

      {requests.length === 0 ? (
        <div className="ws-empty queue-empty">
          <h2>The queue is clear.</h2>
          <p>No organization is waiting for review. New registrations appear here as they arrive.</p>
          <Button variant="outline" to={PATHS.adminOrganizations}>
            Open the registry
          </Button>
        </div>
      ) : (
        <ol role="list" className="queue" aria-label="Review queue, oldest first">
          {requests.map((r, i) => (
            <li key={r.organizationId}>
              <ReviewCard
                request={r}
                position={i + 1}
                decision={decisions[r.organizationId]}
                onDecide={(d) => setDecisions((all) => ({ ...all, [r.organizationId]: d }))}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

type CardProps = {
  request: PendingOrganizationRequest
  position: number
  decision?: Decision
  onDecide: (d: Decision) => void
}

function ReviewCard({ request: r, position, decision, onDecide }: CardProps) {
  const reduced = useReducedMotion()
  const next = position === 1
  const titleId = `req-${r.organizationId}`

  return (
    <motion.article
      className={cn('review', next && 'is-next')}
      aria-labelledby={titleId}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.out, delay: 0.1 + position * 0.06 }}
    >
      <div className="review__pos">
        <span className="review__pos-label t-label">{next ? 'Next up' : 'Queue'}</span>
        <span className="review__num">
          <span className="visually-hidden">Position </span>
          {pad2(position)}
        </span>
        <span className="review__wait">
          <span className="t-label">Waiting</span>
          {waited(r.submittedAt)}
        </span>
      </div>

      <div className="review__body">
        <p className="review__kicker">
          <StatusChip tone="warning">{r.status}</StatusChip>
          <span>
            {ORGANIZATION_TYPE_LABELS[r.type]} · {r.city}
          </span>
        </p>
        <h2 id={titleId} className="review__name">
          {r.organizationName}
        </h2>
        <dl className="review__facts">
          <div>
            <dt>License</dt>
            <dd>
              <code>{r.licenseNumber}</code>
            </dd>
          </div>
          <div>
            <dt>Registration</dt>
            <dd>
              <code>{r.registrationNumber}</code>
            </dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>{r.contactName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd className="review__email">{r.email}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>
              <time dateTime={r.submittedAt}>
                {formatDate(r.submittedAt)} <span className="review__ago">· {formatAgo(r.submittedAt)}</span>
              </time>
              <code className="review__utc">{formatUtc(r.submittedAt)} UTC</code>
            </dd>
          </div>
          <div>
            <dt>Organization ID</dt>
            <dd>
              <code>{r.organizationId}</code>
            </dd>
          </div>
        </dl>
      </div>

      <div className={cn('review__decide', next && 'on-dark')}>
        <p className="review__decide-label t-label">Decision</p>
        <div className="review__buttons">
          <Button variant={next ? 'on-dark' : 'primary'} size="sm" iconStart={<Check />} onClick={() => onDecide('Approve')}>
            Approve<span className="visually-hidden"> {r.organizationName}</span>
          </Button>
          <Button variant="outline" size="sm" iconStart={<X />} onClick={() => onDecide('Reject')}>
            Reject<span className="visually-hidden"> {r.organizationName}</span>
          </Button>
        </div>
        <div role="status" className="review__result">
          {decision && (
            <p className="ws-notice">
              <Info aria-hidden="true" />
              <span>
                <strong>{PROTOTYPE_NOTE}</strong> {decision === 'Approve' ? 'Approval' : 'Rejection'} of {r.organizationName} was
                not recorded; it stays pending.
              </span>
            </p>
          )}
        </div>
      </div>
    </motion.article>
  )
}
