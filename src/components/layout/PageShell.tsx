import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { BARE_PATHS, PAGE_TITLES } from '../../app/routes'
import { duration, ease } from '../../lib/motion'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import './layout.css'

/**
 * Root layout route: skip link, sticky header, <main> with the page transition, footer.
 * Transition is enter-only (no exit / wait), so navigation is never delayed.
 */
export function PageShell() {
  const { pathname, hash } = useLocation()
  const reduced = useReducedMotion()
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'FoodLoop'
  }, [pathname])

  // After in-app navigation, move focus to <main> so screen readers start at the new page.
  // Hash targets are handled by SectionLink / ScrollRestoration instead.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!hash) document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash])

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="page-shell__main">
        <motion.div
          key={pathname}
          className="page-transition"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.page, ease: ease.out }}
        >
          <Outlet />
        </motion.div>
      </main>
      {!BARE_PATHS.includes(pathname) && <SiteFooter />}
      <ScrollRestoration />
    </div>
  )
}
