// Domain types for the admin workspace. Shaped after the FoodLoop API's admin DTOs so R6 can map 1:1.
// Dates are ISO-8601 strings, exactly as they arrive over JSON.
import type { ClaimStatus } from './claim'
import type { QuantityUnit } from './donation'
import type { OrganizationStatus, OrganizationType } from './organization'

/** Headline counts for the admin overview. */
export type AdminDashboardSummary = {
  pendingOrganizations: number
  availableDonations: number
  closedDeliveries: number
  cancelledClaims: number
  expiredDonations: number
}

/** One row of the organization registry. */
export type AdminOrganization = {
  id: string
  name: string
  type: OrganizationType
  status: OrganizationStatus
  licenseNumber: string
  city: string
  createdAt: string
}

/** An organization awaiting approval. Pending requests are Pending organizations, nothing more. */
export type PendingOrganizationRequest = {
  organizationId: string
  organizationName: string
  type: OrganizationType
  licenseNumber: string
  registrationNumber: string
  contactName: string
  email: string
  city: string
  submittedAt: string
  status: Extract<OrganizationStatus, 'Pending'>
}

/** A booked claim with no courier yet. */
export type AssignableClaim = {
  claimId: string
  donationId: string
  donationTitle: string
  quantity: number
  unit: QuantityUnit
  donorOrganizationName: string
  beneficiaryOrganizationName: string
  pickupAddress: string
  expiresAt: string
  claimedAt: string
  status: Extract<ClaimStatus, 'Booked'>
}

/** A courier user an admin can assign. */
export type CourierOption = {
  userId: string
  fullName: string
  email: string
}

export type AuditEntityType = 'Organization' | 'Donation' | 'Claim' | 'HandoverCode'

/** One audit record. The API's Details payload is deliberately not part of this view model. */
export type AuditEntry = {
  id: string
  action: string
  actorName: string
  actorUserId: string
  entityType: AuditEntityType
  entityId: string
  timestampUtc: string
}
