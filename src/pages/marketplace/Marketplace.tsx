import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Hourglass, Search, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { donationPath } from '../../app/routes'
import { BotanicalCorner, BotanicalDecoration } from '../../components/brand/Botanical'
import { DonationCard } from '../../components/food/DonationCard'
import { CATEGORY_META, pickupAreaOf } from '../../components/food/presentation'
import { Button } from '../../components/ui/Button'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { getMockMarketplaceDonations } from '../../data/mock/donations'
import { cn } from '../../lib/cn'
import { describeExpiry } from '../../lib/expiry'
import { duration, ease, spring } from '../../lib/motion'
import { FOOD_CATEGORIES, type FoodCategory } from '../../types/donation'
import './marketplace.css'

const isCategory = (v: string | null): v is FoodCategory => FOOD_CATEGORIES.includes(v as FoodCategory)

export function Marketplace() {
  const reduced = useReducedMotion()
  const listings = getMockMarketplaceDonations()
  // Filters live in the URL so back/forward and "back from details" restore them.
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const rawCategory = params.get('category')
  const category = isCategory(rawCategory) ? rawCategory : null

  function update(key: 'q' | 'category', value: string | null) {
    // Read the live URL: the router's `prev` can be stale when two updates land in quick succession.
    const next = new URLSearchParams(window.location.search)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const needle = query.trim().toLowerCase()
  const results = listings.filter(
    (d) =>
      (!category || d.category === category) &&
      (!needle ||
        [d.title, d.organizationName, pickupAreaOf(d), d.description, CATEGORY_META[d.category].label].some((f) =>
          f.toLowerCase().includes(needle),
        )),
  )
  const closingSoon = listings.filter((d) => describeExpiry(d.expiresAt).urgency === 'critical').slice(0, 3)

  return (
    <div className="market">
      <section className="market-hero on-dark grain" aria-labelledby="market-title">
        <BotanicalDecoration>
          <BotanicalCorner position="top-right" className="market-hero__contours" />
        </BotanicalDecoration>

        <div className="container market-hero__grid">
          <motion.div
            className="market-hero__copy"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.out }}
          >
            <SectionEyebrow>Marketplace · {listings.length} open listings</SectionEyebrow>
            <h1 id="market-title" className="market-hero__title">
              Available <em>food</em>
            </h1>
            <p className="t-lead market-hero__lead">
              Surplus listed by donors across the city, soonest to close first. Claim what your organization can
              store and serve — the donor sees your claim straight away.
            </p>
          </motion.div>

          {closingSoon.length > 0 && (
            <motion.aside
              className="market-soon"
              aria-labelledby="soon-title"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: ease.out, delay: 0.15 }}
            >
              <h2 id="soon-title" className="market-soon__title">
                <Hourglass aria-hidden="true" />
                Closing within 3 hours
              </h2>
              <ol role="list" className="market-soon__list">
                {closingSoon.map((d) => {
                  const e = describeExpiry(d.expiresAt)
                  return (
                    <li key={d.id}>
                      <Link to={donationPath(d.id)} className="market-soon__item">
                        <span className="market-soon__time t-data">{e.relative.replace('Closes in ', '')}</span>
                        <span className="market-soon__what">
                          <span className="market-soon__name">{d.title}</span>
                          <span className="market-soon__org">
                            {d.organizationName} · {pickupAreaOf(d)}
                          </span>
                        </span>
                        <ArrowUpRight aria-hidden="true" className="market-soon__arrow" />
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </motion.aside>
          )}
        </div>
      </section>

      {/* Control deck: overlaps the dark band, so search reads as the page's primary tool. */}
      <div className="container">
        <div className="market-deck">
          <form role="search" className="market-search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="market-q" className="visually-hidden">
              Search available food
            </label>
            <Search aria-hidden="true" className="market-search__icon" />
            <input
              id="market-q"
              type="search"
              className="market-search__input"
              placeholder="Search food, donors or areas"
              value={query}
              onChange={(e) => update('q', e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="market-search__clear" aria-label="Clear search" onClick={() => update('q', null)}>
                <X aria-hidden="true" />
              </button>
            )}
          </form>

          <div className="market-cats" role="group" aria-label="Filter by category">
            {[null, ...FOOD_CATEGORIES].map((c) => {
              const active = c === category
              const count = c ? listings.filter((d) => d.category === c).length : listings.length
              return (
                <button
                  key={c ?? 'all'}
                  type="button"
                  className={cn('market-cat', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => update('category', c)}
                >
                  {active && <motion.span layoutId="market-cat-indicator" className="market-cat__indicator" transition={spring.indicator} />}
                  <span className="market-cat__label">{c ? CATEGORY_META[c].label : 'All'}</span>
                  <span className="market-cat__count t-data">
                    {count}
                    <span className="visually-hidden"> listings</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="container market-results" aria-labelledby="results-title">
        <div className="market-results__head">
          <h2 id="results-title" className="market-results__title">
            {category ? CATEGORY_META[category].label : 'All listings'}
          </h2>
          <p className="market-results__count" role="status">
            {results.length === listings.length
              ? `${listings.length} listings`
              : `Showing ${results.length} of ${listings.length} listings`}
          </p>
        </div>

        {results.length > 0 ? (
          <ul role="list" className="market-grid">
            <AnimatePresence mode="popLayout" initial={!reduced}>
              {results.map((d, i) => (
                <motion.li
                  key={d.id}
                  layout="position"
                  className={cn('market-grid__item', i === 0 && results.length > 2 && 'is-feature')}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: duration.fast } }}
                  transition={{ duration: 0.5, ease: ease.out, delay: Math.min(i, 8) * 0.05 }}
                >
                  <DonationCard donation={d} feature={i === 0 && results.length > 2} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="ws-empty">
            <h3 className="t-h3">Nothing matches that yet.</h3>
            <p>
              No open listings match {query ? `“${query}”` : 'this filter'}
              {category ? ` in ${CATEGORY_META[category].label.toLowerCase()}` : ''}. New surplus is listed throughout the
              day.
            </p>
            <Button variant="outline" onClick={() => setParams({}, { replace: true, preventScrollReset: true })}>
              Clear search and filters
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
