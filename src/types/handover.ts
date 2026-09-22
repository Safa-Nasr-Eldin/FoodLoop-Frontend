// Domain types for courier tasks and handovers. Shaped after the FoodLoop API's DTOs.
import type { ClaimStatus } from './claim'
import type { FoodCategory, QuantityUnit } from './donation'

export type HandoverType = 'Pickup' | 'Delivery'

/** A verified handover. Absence means "not yet recorded". */
export type HandoverEvidence = {
  type: HandoverType
  verifiedAt: string
}

/** Stored explicitly on each mock task — the frontend never derives it from lifecycle rules. */
export type CourierNextStep = 'CollectPickupCode' | 'VerifyPickup' | 'ProceedToBeneficiary' | 'VerifyDelivery' | 'Completed'

export type CourierTask = {
  id: string
  claimId: string
  status: ClaimStatus
  donationTitle: string
  category: FoodCategory
  quantity: number
  unit: QuantityUnit
  expiresAt: string
  donorOrganizationName: string
  pickupAddress: string
  beneficiaryOrganizationName: string
  assignedAt: string
  nextStep: CourierNextStep
  evidence: HandoverEvidence[]
}

export type HandoverCode = {
  id: string
  claimId: string
  /** Organization that presents this code to the courier. */
  holderOrganizationId: string
  donationTitle: string
  type: HandoverType
  /** 64-character code. Fixed mock value — never generated client-side. */
  token: string
  issuedAt: string
  expiresAt: string
  /** Pickup codes only: where the handover happens. */
  pickupAddress?: string
  usedAt?: string
}
