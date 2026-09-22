// UI presentation for claims, courier tasks and handovers: labels, tones, groupings.
// Nothing here decides lifecycle — it only reads what the (mock) API already says.
import type { Claim, ClaimEvent, ClaimStatus } from '../../types/claim'
import type { CourierNextStep, HandoverCode, HandoverType } from '../../types/handover'
import type { StatusTone } from '../ui/StatusChip'

export type ClaimPhase = 'active' | 'done' | 'ended'

export const CLAIM_STATUS_META: Record<ClaimStatus, { label: string; tone: StatusTone; phase: ClaimPhase }> = {
  Booked: { label: 'Booked', tone: 'success', phase: 'active' },
  PickupPending: { label: 'Pickup pending', tone: 'warning', phase: 'active' },
  PickedUp: { label: 'Picked up', tone: 'info', phase: 'active' },
  InTransit: { label: 'In transit', tone: 'info', phase: 'active' },
  Delivered: { label: 'Delivered', tone: 'complete', phase: 'done' },
  Closed: { label: 'Closed', tone: 'complete', phase: 'done' },
  Cancelled: { label: 'Cancelled', tone: 'neutral', phase: 'ended' },
  Failed: { label: 'Failed', tone: 'danger', phase: 'ended' },
}

/** Timeline copy for each recorded transition. */
export const EVENT_LABELS: Record<ClaimStatus, string> = {
  Booked: 'Claim booked',
  PickupPending: 'Courier assigned — pickup pending',
  PickedUp: 'Picked up from the donor',
  InTransit: 'In transit',
  Delivered: 'Delivered',
  Closed: 'Claim closed',
  Cancelled: 'Claim cancelled',
  Failed: 'Handover failed',
}

/** The journey stages, in order. Terminal outcomes (Cancelled / Failed) are not stages. */
export const JOURNEY_STAGES: { status: ClaimStatus; label: string }[] = [
  { status: 'Booked', label: 'Claimed' },
  { status: 'PickupPending', label: 'Courier assigned' },
  { status: 'PickedUp', label: 'Picked up' },
  { status: 'InTransit', label: 'In transit' },
  { status: 'Delivered', label: 'Delivered' },
  { status: 'Closed', label: 'Closed' },
]

export type StageView = { status: ClaimStatus; label: string; event?: ClaimEvent; state: 'reached' | 'current' | 'future' }

/**
 * Journey read straight from recorded events: a stage is reached only if its event exists.
 * The latest reached stage is "current" unless the claim ended (then `terminal` carries the ending).
 */
export function journeyOf(claim: Pick<Claim, 'events'>) {
  const terminal = claim.events.find((e) => e.type === 'Cancelled' || e.type === 'Failed')
  const byType = new Map(claim.events.map((e) => [e.type, e]))
  const lastReached = JOURNEY_STAGES.reduce((acc, s, i) => (byType.has(s.status) ? i : acc), -1)
  const stages: StageView[] = JOURNEY_STAGES.map((s, i) => ({
    ...s,
    event: byType.get(s.status),
    state: i < lastReached || (i === lastReached && terminal) ? 'reached' : i === lastReached ? 'current' : 'future',
  }))
  return { stages, lastReached, terminal }
}

export type TaskLane = 'collect' | 'deliver' | 'done'

export const TASK_LANES: { id: TaskLane; label: string }[] = [
  { id: 'collect', label: 'To collect' },
  { id: 'deliver', label: 'To deliver' },
  { id: 'done', label: 'Completed' },
]

export const NEXT_STEP_META: Record<
  CourierNextStep,
  { label: string; detail: string; lane: TaskLane; verify?: HandoverType; action?: string }
> = {
  CollectPickupCode: {
    label: 'Collect pickup handover code',
    detail: 'Ask the donor to show their pickup handover code, then enter it to verify the pickup.',
    lane: 'collect',
    verify: 'Pickup',
    action: 'Enter pickup code',
  },
  VerifyPickup: {
    label: 'Verify pickup',
    detail: 'You have the donor’s pickup code. Enter it to record the pickup handover.',
    lane: 'collect',
    verify: 'Pickup',
    action: 'Verify pickup',
  },
  ProceedToBeneficiary: {
    label: 'Proceed to beneficiary',
    detail: 'Pickup is verified. Take the donation to the beneficiary and ask for their delivery code on arrival.',
    lane: 'deliver',
    verify: 'Delivery',
    action: 'Verify delivery on arrival',
  },
  VerifyDelivery: {
    label: 'Verify delivery',
    detail: 'Ask the beneficiary to show their delivery handover code, then enter it to record the delivery.',
    lane: 'deliver',
    verify: 'Delivery',
    action: 'Verify delivery',
  },
  Completed: { label: 'Completed', detail: 'Both handovers are verified. Nothing left to do on this task.', lane: 'done' },
}

/** Where the courier stands on the route, read from the claim status. 0 at donor · 1 on the road · 2 at beneficiary. */
export const routeLegOf = (status: ClaimStatus) =>
  status === 'Delivered' || status === 'Closed' ? 2 : status === 'PickedUp' || status === 'InTransit' ? 1 : 0

/** Who presents a code, and when. */
export const HANDOVER_SHOWN_BY: Record<HandoverType, string> = {
  Pickup: 'Show this code to the courier when they collect the donation.',
  Delivery: 'Show this code to the courier when they deliver the donation.',
}

export type CodeState = 'Active' | 'Used' | 'Expired'
/** Display state from recorded fields: a used code stays used; otherwise its window decides. */
export const codeStateOf = (c: Pick<HandoverCode, 'usedAt' | 'expiresAt'>, now = Date.now()): CodeState =>
  c.usedAt ? 'Used' : new Date(c.expiresAt).getTime() <= now ? 'Expired' : 'Active'

export const CODE_STATE_TONE: Record<CodeState, StatusTone> = { Active: 'success', Used: 'complete', Expired: 'neutral' }

/** "#C-3104" style reference for display. */
export const refOf = (id: string) => `#${id.toUpperCase()}`
