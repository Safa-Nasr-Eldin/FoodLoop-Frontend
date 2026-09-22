import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Info, MapPin, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PATHS, editDonationPath } from '../../app/routes'
import { FoodLoopMark } from '../../components/brand/FoodLoopMark'
import { FoodMedia } from '../../components/food/FoodMedia'
import { CATEGORY_META, STATUS_META, formatQuantity, pickupAreaOf } from '../../components/food/presentation'
import { MagneticButton } from '../../components/motion/MagneticButton'
import { MediaReveal } from '../../components/motion/MediaReveal'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getDonationEditCapability, getMockDonationById } from '../../data/mock/donations'
import { getCurrentMockOrganization } from '../../data/mock/organization'
import { describeExpiry, expiryPhrase, formatAbsolute, formatAgo } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import './donations.css'

export function DonationDetails() {
  const { id = '' } = useParams()
  const reduced = useReducedMotion()
  const [claimNote, setClaimNote] = useState(false)
  const donation = getMockDonationById(id)

  if (!donation) return <MissingDonation />

  const d = donation
  const own = d.organizationId === getCurrentMockOrganization().id
  const expiry = describeExpiry(d.expiresAt)
  const status = STATUS_META[d.status]
  const category = CATEGORY_META[d.category]
  const CategoryIcon = category.icon
  const back = own ? { to: PATHS.donations, label: 'My donations' } : { to: PATHS.marketplace, label: 'Marketplace' }

  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: ease.out, delay },
  })

  return (
    <div className="container ws-page detail">
      <Link to={back.to} className="ws-back">
        <ArrowLeft aria-hidden="true" />
        {back.label}
      </Link>

      <div className="detail__grid">
        <article className="detail__main" aria-labelledby="detail-title">
          <div className="detail__media-wrap">
            <MediaReveal className="detail__media">
              <FoodMedia category={d.category} imageUrl={d.imageUrl} priority className="detail__img" />
            </MediaReveal>
            <span className="detail__category">
              <CategoryIcon aria-hidden="true" />
              {category.label}
            </span>
          </div>

          <motion.header className="detail__head" {...enter(0.2)}>
            <p className="detail__kicker t-label">
              Listed {formatAgo(d.createdAt)} · {pickupAreaOf(d)}
            </p>
            <h1 id="detail-title" className="detail__title">
              {d.title}
            </h1>
            <p className="detail__org">
              <Building2 aria-hidden="true" />
              <span>
                Donated by <strong>{d.organizationName}</strong>
                {own && <span className="detail__own"> · your organization</span>}
              </span>
            </p>
          </motion.header>

          <motion.div className="detail__body" {...enter(0.3)}>
            <h2 className="detail__section-title t-label">About this food</h2>
            <p className="detail__desc">{d.description}</p>
            <h2 className="detail__section-title t-label">Where to collect</h2>
            <p className="detail__address">
              <MapPin aria-hidden="true" />
              {d.pickupAddress}
            </p>
          </motion.div>
        </article>

        <motion.aside
          className="ticket on-dark grain"
          aria-labelledby="ticket-title"
          initial={reduced ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: ease.out, delay: 0.25 }}
        >
          <header className="ticket__head">
            <h2 id="ticket-title" className="ticket__kind t-label">
              Pickup ticket
            </h2>
            <span className="ticket__ref t-data">#{d.id.toUpperCase()}</span>
            <FoodLoopMark className="ticket__mark" />
          </header>

          <motion.div
            className="ticket__status"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.out, delay: 0.55 }}
          >
            <StatusChip tone={status.tone}>{status.label}</StatusChip>
            <p className={`ticket__urgency is-${expiry.urgency}`}>{expiryPhrase(expiry)}</p>
            <p className="ticket__urgency-meta">
              <strong>{expiry.urgencyLabel}</strong> · {expiry.absolute}
            </p>
          </motion.div>

          <div className="ticket__tear" aria-hidden="true" />

          <dl className="ticket__facts">
            <div>
              <dt>Category</dt>
              <dd>{category.label}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd className="t-data">{formatQuantity(d)}</dd>
            </div>
            <div className="ticket__fact--wide">
              <dt>Expires</dt>
              <dd>
                <time dateTime={d.expiresAt}>{formatAbsolute(d.expiresAt)}</time>
              </dd>
            </div>
            <div className="ticket__fact--wide">
              <dt>Pickup location</dt>
              <dd>{d.pickupAddress}</dd>
            </div>
            <div className="ticket__fact--wide">
              <dt>Organization</dt>
              <dd>{d.organizationName}</dd>
            </div>
            <div>
              <dt>Listed</dt>
              <dd>
                <time dateTime={d.createdAt}>{formatAgo(d.createdAt)}</time>
              </dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>
                <time dateTime={d.updatedAt}>{formatAgo(d.updatedAt)}</time>
              </dd>
            </div>
          </dl>

          <div className="ticket__tear" aria-hidden="true" />

          <div className="ticket__actions">
            {own ? (
              <>
                <p className="ticket__hint">
                  {d.status === 'Draft'
                    ? 'Your draft — not visible on the marketplace yet.'
                    : `Your listing · ${status.label.toLowerCase()}.`}
                </p>
                {getDonationEditCapability(d).canEdit && (
                  <Button variant="on-dark" size="lg" to={editDonationPath(d.id)} iconStart={<Pencil />}>
                    Edit donation
                  </Button>
                )}
              </>
            ) : d.status === 'Available' ? (
              <MagneticButton className="ticket__claim">
                <Button variant="on-dark" size="lg" iconEnd={<ArrowRight />} onClick={() => setClaimNote(true)}>
                  Claim donation
                </Button>
              </MagneticButton>
            ) : (
              <p className="ticket__hint">This listing is {status.label.toLowerCase()} and can no longer be claimed.</p>
            )}
            <div role="status" className="ticket__status-slot">
              {claimNote && (
                <p className="ws-notice">
                  <Info aria-hidden="true" />
                  Prototype only — claiming isn’t connected yet. Nothing was sent, and this listing is unchanged.
                </p>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}

function MissingDonation() {
  return (
    <div className="container ws-page">
      <div className="ws-empty">
        <h1 className="t-h2">This donation isn’t listed.</h1>
        <p>It may have been removed, or the link is incomplete. Current listings are on the marketplace.</p>
        <Button to={PATHS.marketplace} iconStart={<ArrowLeft />}>
          Back to marketplace
        </Button>
      </div>
    </div>
  )
}
