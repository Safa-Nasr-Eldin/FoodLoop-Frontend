// MOCK DATA BOUNDARY — sample claims for frontend development.
// Pages read claims only through the functions at the bottom; R6 replaces them with API calls.
// Every event below is a transition that "happened" — nothing is added to fill a timeline.
import type { Claim } from '../../types/claim'
import { SAMPLE_BENEFICIARY } from './organization'

const HOUR = 3_600_000
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()

const beneficiary = { beneficiaryOrganizationId: SAMPLE_BENEFICIARY.id, beneficiaryOrganizationName: SAMPLE_BENEFICIARY.name }
const HARBOUR = { donorOrganizationName: 'Harbour Street Kitchen', pickupAddress: '14 Harbour Street, Harbourside' }

const CLAIMS: Claim[] = [
  {
    id: 'c-3101',
    donationId: 'd-104',
    donationTitle: 'Chicken & rice meal boxes',
    category: 'PreparedMeals',
    quantity: 48,
    unit: 'portions',
    expiresAt: at(5),
    ...HARBOUR,
    ...beneficiary,
    status: 'Booked',
    claimedAt: at(-0.6),
    events: [{ type: 'Booked', occurredAt: at(-0.6), note: 'Claimed from the marketplace.' }],
    canCancel: true,
  },
  {
    id: 'c-3102',
    donationId: 'd-109',
    donationTitle: 'Cheese board surplus',
    category: 'Dairy',
    quantity: 6,
    unit: 'kg',
    expiresAt: at(8),
    ...HARBOUR,
    ...beneficiary,
    status: 'PickupPending',
    claimedAt: at(-1.4),
    events: [
      { type: 'Booked', occurredAt: at(-1.4), note: 'Claimed from the marketplace.' },
      { type: 'PickupPending', occurredAt: at(-1), note: 'A courier was assigned to collect this donation.' },
    ],
    canCancel: true,
  },
  {
    id: 'c-3103',
    donationId: 'd-210',
    donationTitle: 'Sandwich platters',
    category: 'PreparedMeals',
    quantity: 30,
    unit: 'portions',
    expiresAt: at(4),
    donorOrganizationName: 'Canteen Seven',
    pickupAddress: 'Unit 7, Canal Works, Eastside',
    ...beneficiary,
    status: 'PickedUp',
    claimedAt: at(-3),
    events: [
      { type: 'Booked', occurredAt: at(-3) },
      { type: 'PickupPending', occurredAt: at(-2.4), note: 'A courier was assigned to collect this donation.' },
      { type: 'PickedUp', occurredAt: at(-0.5), note: 'Pickup handover verified at the donor.' },
    ],
    canCancel: false,
  },
  {
    id: 'c-3104',
    donationId: 'd-105',
    donationTitle: 'Greek yogurt & whole milk',
    category: 'Dairy',
    quantity: 24,
    unit: 'litres',
    expiresAt: at(20),
    ...HARBOUR,
    ...beneficiary,
    status: 'InTransit',
    claimedAt: at(-4),
    events: [
      { type: 'Booked', occurredAt: at(-4) },
      { type: 'PickupPending', occurredAt: at(-3), note: 'A courier was assigned to collect this donation.' },
      { type: 'PickedUp', occurredAt: at(-0.8), note: 'Pickup handover verified at the donor.' },
      { type: 'InTransit', occurredAt: at(-0.3), note: 'On the way to your pantry. Keep refrigeration space ready.' },
    ],
    canCancel: false,
  },
  {
    id: 'c-3105',
    donationId: 'd-106',
    donationTitle: 'Seasonal soup batch',
    category: 'PreparedMeals',
    quantity: 30,
    unit: 'portions',
    expiresAt: at(-20),
    ...HARBOUR,
    ...beneficiary,
    status: 'Delivered',
    claimedAt: at(-28),
    events: [
      { type: 'Booked', occurredAt: at(-28) },
      { type: 'PickupPending', occurredAt: at(-27) },
      { type: 'PickedUp', occurredAt: at(-24.5), note: 'Pickup handover verified at the donor.' },
      { type: 'InTransit', occurredAt: at(-24.2) },
      { type: 'Delivered', occurredAt: at(-22), note: 'Delivery handover verified at your pantry.' },
    ],
    canCancel: false,
  },
  {
    id: 'c-3106',
    donationId: 'd-107',
    donationTitle: 'Brunch pastries',
    category: 'Bakery',
    quantity: 40,
    unit: 'items',
    expiresAt: at(-70),
    ...HARBOUR,
    ...beneficiary,
    status: 'Closed',
    claimedAt: at(-79),
    events: [
      { type: 'Booked', occurredAt: at(-79) },
      { type: 'PickupPending', occurredAt: at(-78) },
      { type: 'PickedUp', occurredAt: at(-75), note: 'Pickup handover verified at the donor.' },
      { type: 'InTransit', occurredAt: at(-74.8) },
      { type: 'Delivered', occurredAt: at(-73.5), note: 'Delivery handover verified at your pantry.' },
      { type: 'Closed', occurredAt: at(-72) },
    ],
    canCancel: false,
  },
  {
    id: 'c-3107',
    donationId: 'd-110',
    donationTitle: 'Event catering leftovers',
    category: 'Mixed',
    quantity: 60,
    unit: 'portions',
    expiresAt: at(-90),
    ...HARBOUR,
    ...beneficiary,
    status: 'Cancelled',
    claimedAt: at(-98),
    events: [
      { type: 'Booked', occurredAt: at(-98) },
      { type: 'Cancelled', occurredAt: at(-96), note: 'The donor withdrew this listing.' },
    ],
    canCancel: false,
  },
  {
    id: 'c-3108',
    donationId: 'd-211',
    donationTitle: 'Chilled soup tubs',
    category: 'PreparedMeals',
    quantity: 20,
    unit: 'portions',
    expiresAt: at(-26),
    donorOrganizationName: 'Green Valley Farm',
    pickupAddress: 'Green Valley Farm Shop, Riverside Road',
    ...beneficiary,
    status: 'Failed',
    claimedAt: at(-31),
    events: [
      { type: 'Booked', occurredAt: at(-31) },
      { type: 'PickupPending', occurredAt: at(-30) },
      { type: 'Failed', occurredAt: at(-26), note: 'The pickup window closed before a handover could be verified.' },
    ],
    canCancel: false,
  },

  // ---- Another beneficiary's claim: only reachable through the sample courier's task list ----
  {
    id: 'c-3201',
    donationId: 'd-212',
    donationTitle: 'End-of-day bakery mix',
    category: 'Bakery',
    quantity: 35,
    unit: 'items',
    expiresAt: at(3.5),
    donorOrganizationName: 'Crumb & Co. Bakery',
    pickupAddress: '31 Mill Lane, Old Town',
    beneficiaryOrganizationId: 'org-northkitchen',
    beneficiaryOrganizationName: 'Northside Community Kitchen',
    status: 'PickupPending',
    claimedAt: at(-1.2),
    events: [
      { type: 'Booked', occurredAt: at(-1.2) },
      { type: 'PickupPending', occurredAt: at(-0.7) },
    ],
    canCancel: false,
  },
]

/** The sample beneficiary's claims, most recently claimed first. */
export function getMockClaims(): Claim[] {
  return CLAIMS.filter((c) => c.beneficiaryOrganizationId === SAMPLE_BENEFICIARY.id).sort((a, b) =>
    b.claimedAt.localeCompare(a.claimedAt),
  )
}

export function getMockClaimById(id: string): Claim | undefined {
  return CLAIMS.find((c) => c.id === id)
}
