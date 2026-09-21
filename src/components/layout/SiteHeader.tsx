import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { PRIMARY_NAV } from '../../app/routes'
import { cn } from '../../lib/cn'
import { duration, ease, spring } from '../../lib/motion'
import { BotanicalCorner, BotanicalDecoration } from '../brand/Botanical'
import { FoodLoopWordmark } from '../brand/FoodLoopMark'
import { Button } from '../ui/Button'
import './layout.css'

const DESKTOP_QUERY = '(min-width: 1024px)'
const FOCUSABLE = 'a[href], button:not([disabled])'

export function SiteHeader() {
  const [active, setActive] = useState(PRIMARY_NAV[0].href)
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu open: focus first item, Escape closes, Tab cycles toggle <-> sheet, page scroll locked.
  useEffect(() => {
    if (!open) return
    const sheet = sheetRef.current
    const toggle = toggleRef.current
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    document.documentElement.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle?.focus()
        return
      }
      if (e.key !== 'Tab' || !sheet || !toggle) return
      const items = [toggle, ...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const i = items.indexOf(document.activeElement as HTMLElement)
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length
      e.preventDefault()
      items[next].focus()
    }
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onResize = () => mq.matches && setOpen(false)

    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onResize)
    return () => {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onResize)
    }
  }, [open])

  function navigate(e: MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault() // R1: no router yet — placeholder links only track active state.
    setActive(href)
    setOpen(false)
  }

  const indicatorAt = hovered ?? active

  return (
    <header className={cn('site-header', scrolled && 'is-scrolled', open && 'is-open')}>
      <div className="container site-header__bar">
        <a href="/" className="site-header__brand" aria-label="FoodLoop home" onClick={(e) => e.preventDefault()}>
          <FoodLoopWordmark />
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul role="list" className="site-nav__list" onMouseLeave={() => setHovered(null)}>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="site-nav__link"
                  aria-current={active === item.href ? 'page' : undefined}
                  onClick={(e) => navigate(e, item.href)}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                >
                  {indicatorAt === item.href && (
                    <motion.span layoutId="nav-indicator" className="site-nav__indicator" transition={spring.indicator} />
                  )}
                  <span className="site-nav__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Button variant="ghost" size="sm" href="#" className="site-header__signin">
            Sign in
          </Button>
          <Button variant="primary" size="sm" href="#" iconEnd={<ArrowUpRight />} className="site-header__cta">
            Donate surplus
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-toggle__line" />
            <span className="menu-toggle__line" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            id="mobile-menu"
            className="menu-sheet on-dark grain"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: duration.fast } }}
            transition={{ duration: duration.ui, ease: ease.out }}
          >
            <BotanicalDecoration>
              <BotanicalCorner position="bottom-right" className="menu-sheet__corner" />
            </BotanicalDecoration>
            <nav aria-label="Mobile" className="container menu-sheet__inner">
              <motion.ul
                role="list"
                className="menu-sheet__list"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } } }}
              >
                {PRIMARY_NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: duration.ui, ease: ease.out } },
                    }}
                  >
                    <a
                      href={item.href}
                      className="menu-sheet__link"
                      aria-current={active === item.href ? 'page' : undefined}
                      onClick={(e) => navigate(e, item.href)}
                    >
                      <span className="menu-sheet__index">{String(i + 1).padStart(2, '0')}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="menu-sheet__actions">
                <Button variant="on-dark" size="lg" href="#" iconEnd={<ArrowUpRight />}>
                  Donate surplus
                </Button>
                <Button variant="outline" size="lg" href="#">
                  Sign in
                </Button>
              </div>
              <p className="menu-sheet__tagline t-label">Rescue · Redistribute · Repeat</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
