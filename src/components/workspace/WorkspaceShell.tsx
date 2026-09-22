import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useMatch } from 'react-router-dom'
import { PATHS, WORKSPACE_ROLES, type WorkspaceRole } from '../../app/routes'
import { getMockDonationById } from '../../data/mock/donations'
import { getCurrentMockOrganization } from '../../data/mock/organization'
import { spring } from '../../lib/motion'
import { FoodLoopWordmark } from '../brand/FoodLoopMark'
import { PageShell } from '../layout/PageShell'
import { SAMPLE_PROFILES, WorkspaceRoleContext, roleOfPath } from './role'
import './workspace.css'

/** Layout route for signed-in product pages: same shell mechanics as the public site, product chrome. */
export function WorkspaceShell() {
  const { pathname } = useLocation()
  // /donations/:id is shared by both sections: another donor's listing belongs to Marketplace.
  // (/donations/new also matches the pattern, so only a listing that exists counts.)
  const detailId = useMatch(PATHS.donation)?.params.id
  const listing = detailId ? getMockDonationById(detailId) : undefined
  const foreignListing = !!listing && listing.organizationId !== getCurrentMockOrganization().id

  // Role-specific pages set the sample role; shared pages (marketplace, handover codes) keep the last one.
  // Couriers and admins have no shared pages, so those fall back to the beneficiary view.
  const own = foreignListing ? undefined : roleOfPath(pathname)
  const [last, setLast] = useState<WorkspaceRole>(own ?? 'beneficiary')
  if (own && own !== last) setLast(own)
  const role = own ?? (last === 'courier' || last === 'admin' ? 'beneficiary' : last)

  return (
    <WorkspaceRoleContext.Provider value={role}>
      <PageShell
        header={
          <>
            <RoleStrip role={role} />
            <WorkspaceHeader role={role} current={foreignListing ? PATHS.marketplace : undefined} />
          </>
        }
        footer={<WorkspaceFooter />}
      />
    </WorkspaceRoleContext.Provider>
  )
}

/** Development affordance: jump between the sample roles. Scrolls away; the header stays sticky. */
function RoleStrip({ role }: { role: WorkspaceRole }) {
  return (
    <nav className="ws-roles" aria-label="Sample role">
      <div className="container ws-roles__inner">
        <span className="ws-roles__label">Viewing as sample</span>
        <ul role="list" className="ws-roles__list">
          {WORKSPACE_ROLES.map((r) => (
            <li key={r.id}>
              <Link to={r.home} className="ws-roles__link" aria-current={r.id === role ? 'true' : undefined}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function WorkspaceHeader({ role, current: forced }: { role: WorkspaceRole; current?: string }) {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const nav = WORKSPACE_ROLES.find((r) => r.id === role)!.nav
  // Deepest matching item wins: /admin/organizations/pending is "Pending requests", not "Overview".
  const current =
    forced ??
    nav
      .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
      .reduce<string | undefined>((best, i) => (i.to.length > (best?.length ?? 0) ? i.to : best), undefined)
  const profile = SAMPLE_PROFILES[role]
  const initials = profile.person
    .split(' ')
    .map((w) => w[0])
    .join('')

  // On the admin nav's narrow horizontally-scrolling strip, keep the active item in view on arrival.
  // A no-op everywhere else, since those navs never overflow their track.
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [current])

  return (
    <header className={`ws-header ws-header--${role} on-dark grain`}>
      <div className="container ws-header__bar">
        <div className="ws-header__brand">
          <Link to={PATHS.home} className="ws-header__home" aria-label="FoodLoop home">
            <FoodLoopWordmark />
          </Link>
          <span className="ws-header__context t-label" aria-hidden="true">
            {WORKSPACE_ROLES.find((r) => r.id === role)!.label}
          </span>
        </div>

        <nav ref={navRef} className="ws-nav" aria-label="Workspace">
          <ul role="list" className="ws-nav__list">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="ws-nav__link" aria-current={current === item.to ? 'page' : undefined}>
                  {current === item.to && (
                    <motion.span layoutId="ws-nav-indicator" className="ws-nav__indicator" transition={spring.indicator} />
                  )}
                  <span className="ws-nav__label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Presentation only: there is no session. The tag says so once, quietly. */}
        <div className="ws-profile">
          <span className="ws-profile__text">
            <span className="ws-profile__name">{profile.person}</span>
            <span className="ws-profile__org">{profile.organizationName}</span>
          </span>
          <span className="ws-profile__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="ws-profile__tag">Sample account</span>
        </div>
      </div>
    </header>
  )
}

function WorkspaceFooter() {
  return (
    <footer className="ws-footer">
      <div className="container ws-footer__inner">
        <p>
          <span className="ws-footer__dot" aria-hidden="true" />
          Frontend prototype · sample data only. Nothing on these pages is sent or stored.
        </p>
        <Link to={PATHS.home} className="link-underline">
          Back to the public site
        </Link>
      </div>
    </footer>
  )
}
