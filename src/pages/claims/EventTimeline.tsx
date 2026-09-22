import { motion, useReducedMotion } from 'framer-motion'
import { CLAIM_STATUS_META, EVENT_LABELS } from '../../components/operations/presentation'
import { cn } from '../../lib/cn'
import { formatAbsolute, formatAgo } from '../../lib/expiry'
import { revealVariants } from '../../lib/motion'
import type { ClaimEvent } from '../../types/claim'

/** Recorded history only, oldest first. Events reveal one after another when the list enters view. */
export function EventTimeline({ events }: { events: ClaimEvent[] }) {
  const reduced = useReducedMotion()
  return (
    <motion.ol
      role="list"
      className="timeline"
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
    >
      {events.map((e, i) => {
        const [day, time] = formatAbsolute(e.occurredAt).split(' · ')
        const latest = i === events.length - 1
        return (
          <motion.li
            key={`${e.type}-${e.occurredAt}`}
            className={cn('timeline__event', `timeline__event--${CLAIM_STATUS_META[e.type].phase}`, latest && 'is-latest')}
            variants={revealVariants}
          >
            <time className="timeline__when" dateTime={e.occurredAt}>
              <span className="timeline__time t-data">{time}</span>
              <span className="timeline__day">{day}</span>
            </time>
            <span className="timeline__node" aria-hidden="true" />
            <div className="timeline__body">
              <p className="timeline__type t-label">
                {CLAIM_STATUS_META[e.type].label}
                {latest && <span className="timeline__latest">Latest</span>}
              </p>
              <p className="timeline__label">{EVENT_LABELS[e.type]}</p>
              {e.note && <p className="timeline__note">{e.note}</p>}
              <p className="timeline__ago">{formatAgo(e.occurredAt)}</p>
            </div>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
