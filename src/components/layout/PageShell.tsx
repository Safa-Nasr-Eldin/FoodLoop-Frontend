import type { ReactNode } from 'react'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import './layout.css'

/** Global frame: skip link, sticky header, <main>, footer. Every page renders inside this. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="page-shell__main">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
