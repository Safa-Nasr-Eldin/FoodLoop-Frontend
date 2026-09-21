import { motion, useReducedMotion } from 'framer-motion'
import { Ban, BadgeCheck, Clock, Globe, Lock, Mail, MapPin, Phone, ShieldAlert, UserRound, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BotanicalBranch, BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { CATEGORY_META } from '../../components/food/presentation'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { StatusChip, type StatusTone } from '../../components/ui/StatusChip'
import { getMockOrganizationDonations } from '../../data/mock/donations'
import { getCurrentMockOrganization } from '../../data/mock/organization'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import { FOOD_CATEGORIES } from '../../types/donation'
import { ORGANIZATION_STATUSES, type OrganizationStatus, type OrganizationType } from '../../types/organization'
import './organization.css'

const TYPE_LABEL: Record<OrganizationType, string> = {
  Restaurant: 'Restaurant',
  Bakery: 'Bakery',
  Grocery: 'Grocery',
  Caterer: 'Caterer',
  Farm: 'Farm',
  FoodBank: 'Food bank',
  CommunityKitchen: 'Community kitchen',
}

type StatusView = { tone: StatusTone; icon: LucideIcon; title: string; body: string; steps: ('done' | 'current' | 'stopped' | 'todo')[] }

// Presentation for each account status. Read-only: status changes are made by FoodLoop admins, never here.
const STATUS_VIEW: Record<OrganizationStatus, StatusView> = {
  Active: {
    tone: 'success',
    icon: BadgeCheck,
    title: 'Verified and active',
    body: 'Your organization is approved. You can list surplus and every listing shows your verified name.',
    steps: ['done', 'done', 'done'],
  },
  Pending: {
    tone: 'warning',
    icon: Clock,
    title: 'Under review',
    body: 'An administrator is checking your registration and licence. Listings go live once the review is complete.',
    steps: ['done', 'current', 'todo'],
  },
  Suspended: {
    tone: 'danger',
    icon: ShieldAlert,
    title: 'Temporarily suspended',
    body: 'New listings are paused while an administrator looks into your account. Existing records stay visible to you.',
    steps: ['done', 'done', 'stopped'],
  },
  Rejected: {
    tone: 'danger',
    icon: Ban,
    title: 'Application not approved',
    body: 'Your application could not be verified. Contact FoodLoop support to understand what is needed to apply again.',
    steps: ['done', 'stopped', 'todo'],
  },
}
const STEP_LABELS = ['Application received', 'Registration reviewed', 'Listing enabled']
const STEP_WORD = { done: 'Done', current: 'In progress', stopped: 'Stopped', todo: 'Not yet' } as const

const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

export function MyOrganization() {
  const reduced = useReducedMotion()
  const base = getCurrentMockOrganization()
  // Design review only: /organization?status=Pending previews the other presentations. Not a control.
  const [params] = useSearchParams()
  const previewStatus = params.get('status')
  const status = ORGANIZATION_STATUSES.find((s) => s === previewStatus) ?? base.status
  const org = { ...base, status }
  const view = STATUS_VIEW[status]
  const StatusIcon = view.icon
  const initials = org.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  // "What we share" is derived from the organization's own listings.
  const donations = getMockOrganizationDonations(org.id)
  const shares = FOOD_CATEGORIES.map((c) => ({ c, n: donations.filter((d) => d.category === c).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)

  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: ease.out, delay },
  })

  return (
    <div className="container ws-page org">
      <div className="org__grid">
        {/* ---- Identity ---- */}
        <motion.section className="org-id on-dark grain" aria-labelledby="org-name" {...enter(0)}>
          <BotanicalDecoration>
            <BotanicalCorner position="top-right" className="org-id__contours" />
            <BotanicalBranch className="org-id__branch" draw={false} />
          </BotanicalDecoration>

          <div className="org-id__emblem" aria-hidden="true">
            {initials}
          </div>
          <SectionEyebrow className="org-id__eyebrow">My organization</SectionEyebrow>
          <h1 id="org-name" className="org-id__name">
            {org.name}
          </h1>
          <p className="org-id__type">
            {TYPE_LABEL[org.type]} · {org.city}
          </p>
          <div className="org-id__status">
            <StatusChip tone={view.tone} icon={<StatusIcon />}>
              {status}
            </StatusChip>
          </div>
          <dl className="org-id__facts">
            <div>
              <dt>Member since</dt>
              <dd>{dateFmt.format(new Date(org.createdAt))}</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd>{org.verifiedAt && (status === 'Active' || status === 'Suspended')
                  ? dateFmt.format(new Date(org.verifiedAt))
                  : 'Not verified'}</dd>
            </div>
          </dl>
        </motion.section>

        <div className="org__content">
          {/* ---- Status ---- */}
          <motion.section className={cn('org-status', `org-status--${view.tone}`)} aria-labelledby="status-title" {...enter(0.08)}>
            <div className="org-status__head">
              <span className="org-status__icon" aria-hidden="true">
                <StatusIcon />
              </span>
              <div>
                <h2 id="status-title" className="org-status__title">
                  {view.title}
                </h2>
                <p className="org-status__body">{view.body}</p>
              </div>
            </div>
            <ol role="list" className="org-steps">
              {STEP_LABELS.map((label, i) => (
                <li key={label} className={`org-step is-${view.steps[i]}`}>
                  <span className="org-step__dot" aria-hidden="true" />
                  <span className="org-step__label">{label}</span>
                  <span className="org-step__state">{STEP_WORD[view.steps[i]]}</span>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* ---- Registration (authoritative, read-only) ---- */}
          <motion.section className="org-block" aria-labelledby="reg-title" {...enter(0.14)}>
            <header className="org-block__head">
              <h2 id="reg-title" className="org-block__title">
                Registration &amp; licence
              </h2>
              <p className="org-block__note">
                <Lock aria-hidden="true" />
                Verified by FoodLoop · read-only
              </p>
            </header>
            <dl className="org-record">
              <ReadOnly label="Food business licence" value={org.licenseNumber} mono />
              <ReadOnly label="Company registration" value={org.registrationNumber} mono />
              <ReadOnly label="Organization type" value={TYPE_LABEL[org.type]} />
              <ReadOnly label="Account status" value={status} />
            </dl>
          </motion.section>

          {/* ---- Contact & location ---- */}
          <motion.section className="org-block" aria-labelledby="contact-title" {...enter(0.2)}>
            <header className="org-block__head">
              <h2 id="contact-title" className="org-block__title">
                Contact &amp; location
              </h2>
            </header>
            <dl className="org-contact">
              <Info icon={UserRound} label="Primary contact" value={org.contactName} />
              <Info icon={Mail} label="Email" value={org.email} />
              <Info icon={Phone} label="Phone" value={org.phone} />
              <Info icon={MapPin} label="Address" value={`${org.address}, ${org.city}`} />
              {org.website && <Info icon={Globe} label="Website" value={org.website} />}
            </dl>
          </motion.section>

          {/* ---- Profile ---- */}
          <motion.section className="org-block org-profile" aria-labelledby="profile-title" {...enter(0.26)}>
            <header className="org-block__head">
              <h2 id="profile-title" className="org-block__title">
                Profile
              </h2>
            </header>
            <p className="org-profile__text">{org.description}</p>
            {shares.length > 0 && (
              <>
                <h3 className="org-profile__sub t-label">What we share</h3>
                <ul role="list" className="org-shares">
                  {shares.map(({ c, n }) => {
                    const Icon = CATEGORY_META[c].icon
                    return (
                      <li key={c}>
                        <Icon aria-hidden="true" />
                        {CATEGORY_META[c].label}
                        <span className="t-data">{n}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  )
}

function ReadOnly({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="org-record__row">
      <dt>{label}</dt>
      <dd className={cn(mono && 't-data org-record__mono')}>
        {value}
        <Lock aria-hidden="true" className="org-record__lock" />
      </dd>
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="org-contact__row">
      <dt>
        <Icon aria-hidden="true" />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  )
}
