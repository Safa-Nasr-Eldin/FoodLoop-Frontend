import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Copy, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PATHS } from '../../app/routes'
import { FoodLoopMark } from '../../components/brand/FoodLoopMark'
import { CODE_STATE_TONE, HANDOVER_SHOWN_BY, codeStateOf } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockHandoverCodeById } from '../../data/mock/handover'
import { cn } from '../../lib/cn'
import { describeExpiry, formatAbsolute } from '../../lib/expiry'
import { ease, spring } from '../../lib/motion'
import { QrPreview } from './QrPreview'
import './handover.css'

// Security-line geometry: a fan of fine sine waves, computed once. Decorative only.
const SECURITY_LINES = Array.from({ length: 14 }, (_, i) => {
  const pts: string[] = []
  for (let x = 0; x <= 400; x += 8) {
    const y = 40 + i * 9 + Math.sin(x / 38 + i * 0.45) * (10 + i * 0.8) + Math.sin(x / 13 - i) * 2
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return `M${pts.join('L')}`
})

type CopyState = 'idle' | 'copied' | 'failed'
const FEEDBACK_MS = 1500

export function HandoverPass() {
  const { id = '' } = useParams()
  const reduced = useReducedMotion()
  const code = getMockHandoverCodeById(id)
  const [copy, setCopy] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!code) {
    return (
      <div className="container ws-page">
        <div className="ws-empty">
          <h1 className="t-h2">This handover code isn’t available.</h1>
          <p>It may have been replaced, or the link is incomplete.</p>
          <Button to={PATHS.handoverCodes} iconStart={<ArrowLeft />}>
            Back to handover codes
          </Button>
        </div>
      </div>
    )
  }

  const c = code
  const state = codeStateOf(c)
  const expiry = describeExpiry(c.expiresAt)
  // Grouped for reading only; the underlying string (and what gets copied) is the raw token.
  const groups = c.token.match(/.{1,8}/g) ?? [c.token]

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(c.token)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopy('idle'), FEEDBACK_MS)
  }

  return (
    <div className="pass-scene on-dark grain">
      <div className="container pass-scene__inner">
        <div className="pass-scene__context">
          <Link to={PATHS.handoverCodes} className="ws-back">
            <ArrowLeft aria-hidden="true" />
            Handover codes
          </Link>
          <p className="pass-scene__kicker t-label">{c.type} handover code</p>
          <h1 className="pass-scene__title">{c.donationTitle}</h1>
          <p className="pass-scene__lead">{HANDOVER_SHOWN_BY[c.type]} They enter it to confirm the handover.</p>
          <dl className="pass-scene__facts">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusChip tone={CODE_STATE_TONE[state]}>{state}</StatusChip>
              </dd>
            </div>
            <div>
              <dt>Issued</dt>
              <dd>
                <time dateTime={c.issuedAt}>{formatAbsolute(c.issuedAt)}</time>
              </dd>
            </div>
            {c.usedAt && (
              <div>
                <dt>Used</dt>
                <dd>
                  <time dateTime={c.usedAt}>{formatAbsolute(c.usedAt)}</time>
                </dd>
              </div>
            )}
            {c.pickupAddress && (
              <div className="is-wide">
                <dt>Pickup location</dt>
                <dd className="pass-scene__addr">
                  <MapPin aria-hidden="true" />
                  {c.pickupAddress}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <motion.article
          className={cn('pass', state !== 'Active' && 'is-inactive')}
          aria-labelledby="pass-brand"
          initial={reduced ? false : { opacity: 0, y: 48, rotate: -2.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease: ease.out, delay: 0.15 }}
        >
          <svg className="pass__security" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
            {SECURITY_LINES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>

          <header className="pass__head">
            <FoodLoopMark className="pass__mark" />
            <p id="pass-brand" className="pass__brand">
              <span>FoodLoop</span>
              <span>Secure handover</span>
            </p>
            <span className="pass__type">{c.type}</span>
          </header>

          <QrPreview />

          <div className="pass__tear" aria-hidden="true" />

          <div className="pass__code-block">
            <p className="pass__code-label t-label">
              Handover code · 64 characters
            </p>
            <p className="pass__code">
              {groups.map((g, i) => (
                <span key={i}>{g}</span>
              ))}
            </p>
          </div>

          <div className="pass__foot">
            <p className="pass__expiry">
              <span className="t-label">{state === 'Expired' ? 'Expired' : 'Expires'}</span>
              <time dateTime={c.expiresAt}>{expiry.absolute}</time>
            </p>
            <Button
              variant="primary"
              onClick={copyCode}
              iconStart={<Copy />}
              className="pass__copy"
            >
              <motion.span key={copy} initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={spring.ui}>
                {copy === 'copied' ? 'Copied ✓' : 'Copy code'}
              </motion.span>
            </Button>
          </div>
          <p className={cn('pass__live', copy !== 'failed' && 'visually-hidden')} aria-live="polite">
            {copy === 'copied' ? 'Copied ✓' : copy === 'failed' ? 'Couldn’t copy — select the code and copy it instead.' : ''}
          </p>

          {state !== 'Active' && (
            <span className="pass__stamp" aria-hidden="true">
              {state}
            </span>
          )}
        </motion.article>
      </div>
    </div>
  )
}
