import { motion, useReducedMotion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CLAIM_STATUS_META, JOURNEY_STAGES, journeyOf } from '../../components/operations/presentation'
import { cn } from '../../lib/cn'
import { formatAbsolute, formatAgo } from '../../lib/expiry'
import { revealVariants, staggerVariants } from '../../lib/motion'
import type { Claim, ClaimEvent } from '../../types/claim'

type Props = { claim: Claim; variant?: 'full' | 'rail'; className?: string }

const STATE_TEXT = { reached: 'Reached', current: 'Current stage', future: 'Not reached' } as const

/**
 * Lifecycle journey drawn only from recorded events. Future stages are shown as quiet placeholders
 * in the track (never as events); a cancelled / failed claim ends the track with a terminal marker.
 */
export function ClaimJourney({ claim, variant = 'full', className }: Props) {
  const { stages, lastReached, terminal } = journeyOf(claim)
  return variant === 'rail' ? (
    <Rail stages={stages} lastReached={lastReached} terminal={terminal} className={className} />
  ) : (
    <Full stages={stages} lastReached={lastReached} terminal={terminal} className={className} />
  )
}

type JourneyView = ReturnType<typeof journeyOf> & { className?: string }

/** Compact rail for list rows. One image with a full text alternative. */
function Rail({ stages, lastReached, terminal, className }: JourneyView) {
  const current = stages[lastReached]
  const label = terminal
    ? `Journey ended — ${CLAIM_STATUS_META[terminal.type].label.toLowerCase()} after “${current.label}”`
    : `Journey: ${current.label}, stage ${lastReached + 1} of ${stages.length}`
  return (
    <div className={cn('rail', terminal && 'rail--ended', className)} role="img" aria-label={label}>
      {stages.map((s, i) => (
        <span key={s.status} className={cn('rail__stop', `is-${s.state}`)}>
          {i > 0 && <span className="rail__leg" />}
          <span className="rail__dot" />
          {terminal && i === lastReached && (
            <span className="rail__end">
              <X />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

function Full({ stages, lastReached, terminal, className }: JourneyView) {
  const reduced = useReducedMotion()
  const current = stages[lastReached]
  const headline = terminal ?? current.event!
  const headLabel = terminal ? CLAIM_STATUS_META[terminal.type].label : current.label

  return (
    <div className={cn('journey', terminal && 'journey--ended', className)}>
      <div className="journey__now">
        <p className="journey__kicker t-label">{terminal ? 'Journey ended' : 'Current stage'}</p>
        <p className="journey__headline">{headLabel}</p>
        <p className="journey__since">
          <time dateTime={headline.occurredAt}>{formatAgo(headline.occurredAt)}</time>
          {!terminal && ` · stage ${lastReached + 1} of ${JOURNEY_STAGES.length}`}
        </p>
      </div>

      <motion.ol
        role="list"
        className="journey__track"
        style={{ '--stops': stages.length + (terminal ? 1 : 0) } as CSSProperties}
        variants={staggerVariants}
        initial={reduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {stages.flatMap((s, i) => {
          const items = [
            <Stop key={s.status} label={s.label} state={terminal && s.state === 'future' ? 'void' : s.state} event={s.event} />,
          ]
          if (terminal && i === lastReached)
            items.push(<Stop key="terminal" label={CLAIM_STATUS_META[terminal.type].label} state="terminal" event={terminal} />)
          return items
        })}
      </motion.ol>
    </div>
  )
}

type StopState = 'reached' | 'current' | 'future' | 'void' | 'terminal'

function Stop({ label, state, event }: { label: string; state: StopState; event?: ClaimEvent }) {
  const [day, time] = event ? formatAbsolute(event.occurredAt).split(' · ') : []
  const stateText = state === 'void' ? 'Not reached' : state === 'terminal' ? 'Journey ended here' : STATE_TEXT[state]
  return (
    <motion.li className={cn('journey__stop', `is-${state}`)} aria-current={state === 'current' ? 'step' : undefined} variants={revealVariants}>
      <span className="journey__node" aria-hidden="true">
        {state === 'terminal' ? <X /> : (state === 'reached' || state === 'current') && <Check />}
      </span>
      <span className="journey__label">{label}</span>
      <span className="journey__state">{stateText}</span>
      {event && (
        <time className="journey__time" dateTime={event.occurredAt}>
          {day}
          <br />
          {time}
        </time>
      )}
    </motion.li>
  )
}
