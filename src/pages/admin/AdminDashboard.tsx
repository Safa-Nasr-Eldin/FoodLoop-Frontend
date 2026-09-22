import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PATHS } from '../../app/routes'
import { BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { STATUS_META, type StatusPhase } from '../../components/food/presentation'
import { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import {
  getMockAdminSummary,
  getMockAssignableClaims,
  getMockAuditEntries,
  getMockClaimStatusCounts,
  getMockOrganizations,
  getMockPendingRequests,
} from '../../data/mock/admin'
import { getMockDonations } from '../../data/mock/donations'
import { cn } from '../../lib/cn'
import { describeExpiry, formatAgo } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import { ORGANIZATION_STATUSES } from '../../types/organization'
import { AdminIntro } from './kit'
import { daysSince, formatUtcTime, pad2 } from './presentation'
import './dashboard.css'

const PHASES: { id: StatusPhase; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'open', label: 'Available' },
  { id: 'progress', label: 'Claimed or moving' },
  { id: 'done', label: 'Delivered or closed' },
  { id: 'ended', label: 'Expired, cancelled or failed' },
]

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function AdminDashboard() {
  const reduced = useReducedMotion()
  const summary = getMockAdminSummary()
  const organizations = getMockOrganizations()
  const pending = getMockPendingRequests()
  const assignable = getMockAssignableClaims()
  const claims = getMockClaimStatusCounts()
  const donations = getMockDonations()
  const activity = getMockAuditEntries()

  const byPhase = PHASES.map((p) => ({ ...p, count: donations.filter((d) => STATUS_META[d.status].phase === p.id).length }))
  const byOrgStatus = ORGANIZATION_STATUSES.map((s) => ({ status: s, count: organizations.filter((o) => o.status === s).length }))
  const moving = claims.PickupPending + claims.PickedUp + claims.InTransit
  const closingSoon = assignable.filter((c) => describeExpiry(c.expiresAt).urgency === 'critical').length
  const oldestWait = pending.length ? daysSince(pending[0].submittedAt) : 0
  const totalClaims = Object.values(claims).reduce((a, b) => a + b, 0)
  const attention = [summary.pendingOrganizations, assignable.length, summary.expiredDonations].filter(Boolean).length

  // Bars grow from the left as their tile reveals; under reduced motion they render full width at once.
  const grow = (i = 0) => ({
    initial: reduced ? false : { scaleX: 0 },
    whileInView: { scaleX: 1 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: ease.out, delay: 0.25 + i * 0.05 },
  })

  return (
    <div className="container ws-page adm">
      <AdminIntro
        code="ADM-01"
        title={
          <>
            Operations <em>overview</em>
          </>
        }
        lead="Everything moving through FoodLoop right now — what needs a decision first, and what already reached a table."
        meta={[
          plural(organizations.length, 'organization'),
          plural(donations.length, 'donation'),
          plural(totalClaims, 'claim'),
        ]}
      />

      <RevealGroup className="bento">
        {/* ---------------- Operations summary ---------------- */}
        <RevealItem className="bento__tile bento__summary on-dark grain">
          <section aria-labelledby="ops-title" className="ops">
            <BotanicalDecoration>
              <BotanicalCorner position="top-right" className="ops__contours" />
            </BotanicalDecoration>
            <h2 id="ops-title" className="bento__label">
              Food on the network
            </h2>

            <div className="ops__hero">
              <p className="ops__figure t-data">{pad2(summary.availableDonations)}</p>
              <p className="ops__caption">
                <strong>Available donations</strong>
                Open on the marketplace for beneficiaries to claim right now.
              </p>
            </div>

            <div className="ops__flow">
              <p className="ops__flow-title">
                All {donations.length} donations by lifecycle stage
              </p>
              <div className="flowbar" aria-hidden="true">
                {byPhase
                  .filter((p) => p.count)
                  .map((p, i) => (
                    <motion.span key={p.id} className={cn('flowbar__seg', `is-${p.id}`)} style={{ flexGrow: p.count }} {...grow(i)} />
                  ))}
              </div>
              <dl className="flowlegend">
                {byPhase.map((p) => (
                  <div key={p.id} className={`is-${p.id}`}>
                    <dt>
                      <span className="flowlegend__swatch" aria-hidden="true" />
                      {p.label}
                    </dt>
                    <dd className="t-data">{p.count}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <dl className="ops__facts">
              <div>
                <dt>Claims on the move</dt>
                <dd className="t-data">{pad2(moving)}</dd>
              </div>
              <div>
                <dt>Waiting for a courier</dt>
                <dd className="t-data">{pad2(assignable.length)}</dd>
              </div>
              <div>
                <dt>Delivered, not yet closed</dt>
                <dd className="t-data">{pad2(claims.Delivered)}</dd>
              </div>
            </dl>
          </section>
        </RevealItem>

        {/* ---------------- Needs attention ---------------- */}
        <RevealItem className="bento__tile bento__attention">
          <section aria-labelledby="attention-title" className="attention">
            <motion.span
              className="attention__rule"
              aria-hidden="true"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: ease.out, delay: 0.3 }}
            />
            <header className="attention__head">
              <h2 id="attention-title" className="attention__title">
                Needs attention
              </h2>
              <p className="attention__count t-label">{attention ? plural(attention, 'queue') : 'All clear'}</p>
            </header>
            <ol role="list" className="attention__list">
              <li>
                <Link to={PATHS.adminPending} className={cn('attention__item', summary.pendingOrganizations > 0 && 'is-due')}>
                  <span className="attention__num t-data">{pad2(summary.pendingOrganizations)}</span>
                  <span className="attention__text">
                    <strong>Organizations awaiting review</strong>
                    <span>
                      {summary.pendingOrganizations
                        ? `Oldest waiting ${oldestWait === 0 ? 'since today' : plural(oldestWait, 'day')}`
                        : 'The review queue is empty'}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="attention__arrow" />
                </Link>
              </li>
              <li>
                <Link to={PATHS.adminCourier} className={cn('attention__item', assignable.length > 0 && 'is-due')}>
                  <span className="attention__num t-data">{pad2(assignable.length)}</span>
                  <span className="attention__text">
                    <strong>Claims without a courier</strong>
                    <span>{closingSoon ? `${closingSoon} close within 3 hours` : 'None closing within 3 hours'}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="attention__arrow" />
                </Link>
              </li>
              <li>
                <div className={cn('attention__item', summary.expiredDonations > 0 && 'is-due')}>
                  <span className="attention__num t-data">{pad2(summary.expiredDonations)}</span>
                  <span className="attention__text">
                    <strong>Expired donations</strong>
                    <span>Listings that closed unclaimed — follow up with the donor.</span>
                  </span>
                </div>
              </li>
            </ol>
          </section>
        </RevealItem>

        {/* ---------------- Registry ---------------- */}
        <RevealItem className="bento__tile bento__registry">
          <section aria-labelledby="registry-title" className="tile">
            <h2 id="registry-title" className="bento__label">
              Organization registry
            </h2>
            <p className="tile__figure">
              <span className="t-data">{organizations.length}</span> organizations
            </p>
            <div className="statusbar" aria-hidden="true">
              {byOrgStatus
                .filter((s) => s.count)
                .map((s, i) => (
                  <motion.span key={s.status} className={`statusbar__seg is-${s.status.toLowerCase()}`} style={{ flexGrow: s.count }} {...grow(i)} />
                ))}
            </div>
            <dl className="tile__rows">
              {byOrgStatus.map((s) => (
                <div key={s.status} className={`is-${s.status.toLowerCase()}`}>
                  <dt>
                    <span className="tile__swatch" aria-hidden="true" />
                    {s.status}
                  </dt>
                  <dd className="t-data">{s.count}</dd>
                </div>
              ))}
            </dl>
            <Link to={PATHS.adminOrganizations} className="tile__link">
              Manage organizations <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        </RevealItem>

        {/* ---------------- Delivery closure ---------------- */}
        <RevealItem className="bento__tile bento__closure">
          <section aria-labelledby="closure-title" className="tile">
            <h2 id="closure-title" className="bento__label">
              Delivery closure
            </h2>
            <p className="tile__figure">
              <span className="t-data">{pad2(summary.closedDeliveries)}</span> closed deliveries
            </p>
            <p className="tile__note">Handed over, verified and closed. Still in flight:</p>
            <dl className="tile__rows tile__rows--ladder">
              {(
                [
                  ['Pickup pending', claims.PickupPending],
                  ['Picked up', claims.PickedUp],
                  ['In transit', claims.InTransit],
                  ['Delivered, awaiting closure', claims.Delivered],
                ] as const
              ).map(([label, n]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className="t-data">{n}</dd>
                </div>
              ))}
            </dl>
          </section>
        </RevealItem>

        {/* ---------------- Risk ---------------- */}
        <RevealItem className="bento__tile bento__risk">
          <section aria-labelledby="risk-title" className="tile risk">
            <h2 id="risk-title" className="bento__label">
              Lost along the way
            </h2>
            <dl className="risk__pair">
              <div>
                <dt>Cancelled claims</dt>
                <dd className="t-data">{pad2(summary.cancelledClaims)}</dd>
              </div>
              <div>
                <dt>Expired donations</dt>
                <dd className="t-data">{pad2(summary.expiredDonations)}</dd>
              </div>
            </dl>
            <p className="tile__note">
              Food that never reached a table.{' '}
              {claims.Failed ? `Plus ${plural(claims.Failed, 'failed handover')}.` : 'No failed handovers.'}
            </p>
          </section>
        </RevealItem>

        {/* ---------------- Quick actions ---------------- */}
        <RevealItem className="bento__tile bento__actions">
          <nav aria-label="Quick actions" className="quick">
            <ul role="list" className="quick__list">
              {(
                [
                  [PATHS.adminPending, 'Review pending requests', plural(pending.length, 'request')],
                  [PATHS.adminCourier, 'Assign couriers', plural(assignable.length, 'claim')],
                  [PATHS.adminOrganizations, 'Manage organizations', plural(organizations.length, 'record')],
                  [PATHS.adminAudit, 'Open the audit log', plural(activity.length, 'entry', 'entries')],
                ] as const
              ).map(([to, label, count], i) => (
                <li key={to}>
                  <Link to={to} className="quick__link">
                    <span className="quick__index t-data" aria-hidden="true">
                      {pad2(i + 1)}
                    </span>
                    <span className="quick__label">{label}</span>
                    <span className="quick__count">{count}</span>
                    <ArrowRight aria-hidden="true" className="quick__arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </RevealItem>

        {/* ---------------- Recent activity ---------------- */}
        <RevealItem className="bento__tile bento__activity">
          <section aria-labelledby="activity-title" className="activity">
            <header className="activity__head">
              <h2 id="activity-title" className="bento__label">
                Recent activity
              </h2>
              <Link to={PATHS.adminAudit} className="tile__link">
                Full audit log <ArrowRight aria-hidden="true" />
              </Link>
            </header>
            <ol role="list" className="activity__list">
              {activity.slice(0, 6).map((e) => (
                <li key={e.id} className="activity__row">
                  <time dateTime={e.timestampUtc} className="activity__time">
                    <span className="t-data">{formatUtcTime(e.timestampUtc)}</span>
                    <span>{formatAgo(e.timestampUtc)}</span>
                  </time>
                  <code className="activity__action">{e.action}</code>
                  <span className="activity__who">{e.actorName}</span>
                  <span className="activity__entity">
                    {e.entityType} <code>{e.entityId}</code>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </RevealItem>
      </RevealGroup>
    </div>
  )
}
