import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { WORKSPACE_ROLES, handoverCodePath } from '../../app/routes'
import { FoodLoopMark } from '../../components/brand/FoodLoopMark'
import { CODE_STATE_TONE, HANDOVER_SHOWN_BY, codeStateOf } from '../../components/operations/presentation'
import { Button } from '../../components/ui/Button'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { StatusChip } from '../../components/ui/StatusChip'
import { SAMPLE_ORGANIZATION_IDS, useWorkspaceRole } from '../../components/workspace/role'
import { getMockHandoverCodes } from '../../data/mock/handover'
import { cn } from '../../lib/cn'
import { useSession } from '../../lib/session/context'
import { describeExpiry } from '../../lib/expiry'
import { ease } from '../../lib/motion'
import './handover.css'

export function HandoverCodes() {
  const reduced = useReducedMotion()
  const role = useWorkspaceRole()
  const { state } = useSession()
  const organizationName = (state.status === 'authenticated' && state.session.organization?.name) || 'Your organization'
  // Still mock: codes come from sample data until the handover API slice.
  const sampleOrganizationId = SAMPLE_ORGANIZATION_IDS[role]
  const codes = sampleOrganizationId ? getMockHandoverCodes(sampleOrganizationId) : []
  const roleLabel = WORKSPACE_ROLES.find((r) => r.id === role)!.label

  return (
    <div className="container ws-page codes">
      <header className="ws-intro">
        <SectionEyebrow>{roleLabel} workspace</SectionEyebrow>
        <h1 className="ws-intro__title">
          Handover <em>codes</em>
        </h1>
        <p className="t-lead ws-intro__lead">
          Codes {organizationName} shows to the courier. Each one confirms a single handover.
        </p>
      </header>

      {codes.length > 0 ? (
        <ol role="list" className="codes-list">
          {codes.map((c, i) => {
            const state = codeStateOf(c)
            const expiry = describeExpiry(c.expiresAt)
            return (
              <motion.li
                key={c.id}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: ease.out, delay: i * 0.07 }}
              >
                <article className={cn('code-card', `code-card--${state.toLowerCase()}`)} aria-labelledby={`code-${c.id}`}>
                  <div className="code-card__stub" aria-hidden="true">
                    <FoodLoopMark className="code-card__mark" />
                    <span className="code-card__type">{c.type}</span>
                  </div>
                  <div className="code-card__body">
                    <div className="code-card__top">
                      <p className="code-card__kind t-label">{c.type} handover</p>
                      <StatusChip tone={CODE_STATE_TONE[state]}>{state}</StatusChip>
                    </div>
                    <h2 id={`code-${c.id}`} className="code-card__title">
                      {c.donationTitle}
                    </h2>
                    <p className="code-card__hint">{HANDOVER_SHOWN_BY[c.type]}</p>
                    <dl className="code-card__facts">
                      {c.pickupAddress && (
                        <div>
                          <dt>Pickup location</dt>
                          <dd>
                            <MapPin aria-hidden="true" />
                            {c.pickupAddress}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt>{state === 'Active' ? 'Valid until' : 'Expiry'}</dt>
                        <dd>
                          <time dateTime={c.expiresAt}>{expiry.absolute}</time>
                        </dd>
                      </div>
                    </dl>
                    <Button
                      variant={state === 'Active' ? 'primary' : 'outline'}
                      size="sm"
                      to={handoverCodePath(c.id)}
                      iconEnd={<ArrowRight />}
                      className="code-card__action"
                    >
                      Show code<span className="visually-hidden"> for {c.donationTitle}</span>
                    </Button>
                  </div>
                </article>
              </motion.li>
            )
          })}
        </ol>
      ) : (
        <div className="ws-empty">
          <h2>No handover codes.</h2>
          <p>Codes appear here once one of your handovers is ready.</p>
        </div>
      )}
    </div>
  )
}

