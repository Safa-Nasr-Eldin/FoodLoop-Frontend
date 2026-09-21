import { motion } from 'framer-motion'
import { Link, useLocation, useMatch } from 'react-router-dom'
import { PATHS, WORKSPACE_NAV } from '../../app/routes'
import { getMockDonationById } from '../../data/mock/donations'
import { getCurrentMockOrganization } from '../../data/mock/organization'
import { spring } from '../../lib/motion'
import { FoodLoopWordmark } from '../brand/FoodLoopMark'
import { PageShell } from '../layout/PageShell'
import './workspace.css'

/** Layout route for signed-in product pages: same shell mechanics as the public site, product chrome. */
export function WorkspaceShell() {
  return <PageShell header={<WorkspaceHeader />} footer={<WorkspaceFooter />} />
}

function WorkspaceHeader() {
  const org = getCurrentMockOrganization()
  // /donations/:id is shared by both sections: another donor's listing belongs to Marketplace.
  const detailId = useMatch(PATHS.donation)?.params.id
  const foreignListing = !!detailId && getMockDonationById(detailId)?.organizationId !== org.id
  const { pathname } = useLocation()
  const current = foreignListing ? PATHS.marketplace : WORKSPACE_NAV.find((i) => pathname.startsWith(i.to))?.to
  const initials = org.contactName
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <header className="ws-header on-dark grain">
      <div className="container ws-header__bar">
        <div className="ws-header__brand">
          <Link to={PATHS.home} className="ws-header__home" aria-label="FoodLoop home">
            <FoodLoopWordmark />
          </Link>
          <span className="ws-header__context t-label" aria-hidden="true">
            Workspace
          </span>
        </div>

        <nav className="ws-nav" aria-label="Workspace">
          <ul role="list" className="ws-nav__list">
            {WORKSPACE_NAV.map((item) => (
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
            <span className="ws-profile__name">{org.contactName}</span>
            <span className="ws-profile__org">{org.name}</span>
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
