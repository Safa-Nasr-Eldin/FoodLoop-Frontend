// Domain types for claims. Shaped after the FoodLoop API's claim DTO so R6 can map 1:1.
// Dates are ISO-8601 strings, exactly as they arrive over JSON.
import type { FoodCategory, QuantityUnit } from './donation'

export const CLAIM_STATUSES = [
  'Booked',
  'PickupPending',
  'PickedUp',
  'InTransit',
  'Delivered',
  'Closed',
  'Cancelled',
  'Failed',
] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

/** One recorded lifecycle transition. `type` is the status the claim moved into — no extra event vocabulary. */
export type ClaimEvent = {
  type: ClaimStatus
  occurredAt: string
  /** Optional human-safe supporting text. Never IDs, hashes or audit detail. */
  note?: string
}

export type Claim = {
  id: string
  donationId: string
  donationTitle: string
  category: FoodCategory
  quantity: number
  unit: QuantityUnit
  expiresAt: string
  pickupAddress: string
  donorOrganizationName: string
  beneficiaryOrganizationId: string
  beneficiaryOrganizationName: string
  status: ClaimStatus
  claimedAt: string
  /** Recorded history, oldest first. Only real transitions — never placeholders. */
  events: ClaimEvent[]
  /** Prototype stand-in for the API's permission flag. Presentation only. */
  canCancel: boolean
}
