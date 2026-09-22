// MOCK DATA BOUNDARY — handover codes held by the sample donor and beneficiary.
// Tokens are fixed sample strings (not secrets, never generated client-side). R6 replaces these functions.
import type { HandoverCode } from '../../types/handover'

const HOUR = 3_600_000
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()

const HARBOUR = 'org-harbour'
const EAST_PANTRY = 'org-eastpantry'

const CODES: HandoverCode[] = [
  // ---- Pickup codes: the donor shows these to the courier ----
  {
    id: 'hc-01',
    claimId: 'c-3102',
    holderOrganizationId: HARBOUR,
    donationTitle: 'Cheese board surplus',
    type: 'Pickup',
    token: 'E5DA92F4FAF5F5E72BF77D36F51C1DD355409338D346A03F425BB2784833AF9B',
    issuedAt: at(-1),
    expiresAt: at(8),
    pickupAddress: '14 Harbour Street, Harbourside',
  },
  {
    id: 'hc-02',
    claimId: 'c-3104',
    holderOrganizationId: HARBOUR,
    donationTitle: 'Greek yogurt & whole milk',
    type: 'Pickup',
    token: 'C7350AD29C7CEB35F71D0612CB2990722012D3AE20E63C8BECFA436B03562916',
    issuedAt: at(-3),
    expiresAt: at(20),
    pickupAddress: '14 Harbour Street, Harbourside',
    usedAt: at(-0.8),
  },

  // ---- Delivery codes: the beneficiary shows these to the courier ----
  {
    id: 'hc-03',
    claimId: 'c-3104',
    holderOrganizationId: EAST_PANTRY,
    donationTitle: 'Greek yogurt & whole milk',
    type: 'Delivery',
    token: '7FAB7697305E2B0B48BEF38D9B8071665A2DA1EC132ED1703CAD1412975D365F',
    issuedAt: at(-0.8),
    expiresAt: at(20),
  },
  {
    id: 'hc-04',
    claimId: 'c-3103',
    holderOrganizationId: EAST_PANTRY,
    donationTitle: 'Sandwich platters',
    type: 'Delivery',
    token: '928B02D06BCAA9397762FF901C3A6D08B328573B39F604F7EAC2202FEF875338',
    issuedAt: at(-0.5),
    expiresAt: at(4),
  },
  {
    id: 'hc-05',
    claimId: 'c-3105',
    holderOrganizationId: EAST_PANTRY,
    donationTitle: 'Seasonal soup batch',
    type: 'Delivery',
    token: 'FB122AA9ADEFAEBC0AD7BC777C5C7BA5FB61B5033067D5138299FB31C33384ED',
    issuedAt: at(-24.5),
    expiresAt: at(-20),
    usedAt: at(-22),
  },
]

/** Codes one organization presents at handovers. */
export function getMockHandoverCodes(holderOrganizationId: string): HandoverCode[] {
  return CODES.filter((c) => c.holderOrganizationId === holderOrganizationId)
}

export function getMockHandoverCodeById(id: string): HandoverCode | undefined {
  return CODES.find((c) => c.id === id)
}
