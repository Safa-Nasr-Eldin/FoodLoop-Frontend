// MOCK DATA BOUNDARY — network-wide records for the admin workspace. R6 replaces these functions with API calls.
// Every count the admin pages show is derived from the lists below (plus the shared donation / claim mocks).
import type {
  AdminDashboardSummary,
  AdminOrganization,
  AssignableClaim,
  AuditEntityType,
  AuditEntry,
  CourierOption,
  PendingOrganizationRequest,
} from '../../types/admin'
import type { ClaimStatus } from '../../types/claim'
import { getMockAllClaims } from './claims'
import { getMockDonations } from './donations'

const HOUR = 3_600_000
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()
const DAY = 24

// ---------------------------------------------------------------- Organizations
type OrganizationRecord = AdminOrganization & { registrationNumber: string; contactName: string; email: string }

const ORGANIZATIONS: OrganizationRecord[] = [
  { id: 'org-harbour', name: 'Harbour Street Kitchen', type: 'Restaurant', status: 'Active', licenseNumber: 'FBO-2291-HSK', registrationNumber: 'CRN 08812457', contactName: 'Amira Haddad', email: 'surplus@harbourstreetkitchen.example', city: 'London', createdAt: at(-200 * DAY) },
  { id: 'org-eastpantry', name: 'Eastside Community Pantry', type: 'FoodBank', status: 'Active', licenseNumber: 'CHY-1184-ECP', registrationNumber: 'CIO 1184203', contactName: 'Grace Mensah', email: 'hello@eastsidepantry.example', city: 'London', createdAt: at(-188 * DAY) },
  { id: 'org-northkitchen', name: 'Northside Community Kitchen', type: 'CommunityKitchen', status: 'Active', licenseNumber: 'CHY-2207-NCK', registrationNumber: 'CIO 2207781', contactName: 'Tomás Rivera', email: 'kitchen@northside.example', city: 'London', createdAt: at(-161 * DAY) },
  { id: 'org-crumb', name: 'Crumb & Co. Bakery', type: 'Bakery', status: 'Active', licenseNumber: 'FBO-3012-CCB', registrationNumber: 'CRN 11290344', contactName: 'Elena Novak', email: 'ops@crumbandco.example', city: 'London', createdAt: at(-150 * DAY) },
  { id: 'org-canteen7', name: 'Canteen Seven', type: 'Caterer', status: 'Active', licenseNumber: 'FBO-3348-CS7', registrationNumber: 'CRN 12004871', contactName: 'Marcus Bell', email: 'events@canteenseven.example', city: 'London', createdAt: at(-133 * DAY) },
  { id: 'org-greenvalley', name: 'Green Valley Farm', type: 'Farm', status: 'Active', licenseNumber: 'FBO-1920-GVF', registrationNumber: 'CRN 09917265', contactName: 'Hannah Price', email: 'shop@greenvalleyfarm.example', city: 'Surrey', createdAt: at(-127 * DAY) },
  { id: 'org-northmarket', name: 'Northside Market', type: 'Grocery', status: 'Active', licenseNumber: 'FBO-4410-NSM', registrationNumber: 'CRN 13380912', contactName: 'Sanjay Patel', email: 'store@northsidemarket.example', city: 'London', createdAt: at(-98 * DAY) },
  { id: 'org-eastgrocers', name: 'Eastside Grocers', type: 'Grocery', status: 'Active', licenseNumber: 'FBO-4533-ESG', registrationNumber: 'CRN 13502278', contactName: 'Yusuf Demir', email: 'team@eastsidegrocers.example', city: 'London', createdAt: at(-84 * DAY) },
  { id: 'org-riverside', name: 'Riverside Grocer', type: 'Grocery', status: 'Active', licenseNumber: 'FBO-4719-RSG', registrationNumber: 'CRN 13811406', contactName: 'Chloe Martin', email: 'hello@riversidegrocer.example', city: 'Kingston', createdAt: at(-61 * DAY) },
  { id: 'org-stmarks', name: 'St Mark’s Night Shelter', type: 'CommunityKitchen', status: 'Active', licenseNumber: 'CHY-3021-SMS', registrationNumber: 'CIO 3021154', contactName: 'Peter Okafor', email: 'shelter@stmarks.example', city: 'London', createdAt: at(-47 * DAY) },
  { id: 'org-oldtown', name: 'Old Town Food Bank', type: 'FoodBank', status: 'Suspended', licenseNumber: 'CHY-0977-OTF', registrationNumber: 'CIO 0977420', contactName: 'Ruth Adeyemi', email: 'coordinator@oldtownfb.example', city: 'London', createdAt: at(-176 * DAY) },
  { id: 'org-quaycafe', name: 'Quayside Café', type: 'Restaurant', status: 'Suspended', licenseNumber: 'FBO-3906-QSC', registrationNumber: 'CRN 12761530', contactName: 'Luca Romano', email: 'kitchen@quaysidecafe.example', city: 'London', createdAt: at(-72 * DAY) },
  { id: 'org-bigbox', name: 'BigBox Wholesale Outlet', type: 'Grocery', status: 'Rejected', licenseNumber: 'FBO-5102-BBW', registrationNumber: 'CRN 14420077', contactName: 'Dean Walsh', email: 'admin@bigboxwholesale.example', city: 'Croydon', createdAt: at(-30 * DAY) },
  { id: 'org-pophall', name: 'Pop-up Supper Hall', type: 'Caterer', status: 'Rejected', licenseNumber: 'FBO-5188-PSH', registrationNumber: 'CRN 14517302', contactName: 'Nina Berg', email: 'info@popupsupper.example', city: 'London', createdAt: at(-19 * DAY) },
  { id: 'org-millbrook', name: 'Millbrook Community Fridge', type: 'CommunityKitchen', status: 'Pending', licenseNumber: 'CHY-4410-MCF', registrationNumber: 'CIO 4410982', contactName: 'Aisha Rahman', email: 'fridge@millbrook.example', city: 'London', createdAt: at(-3.5 * DAY) },
  { id: 'org-sunrise', name: 'Sunrise Bakehouse', type: 'Bakery', status: 'Pending', licenseNumber: 'FBO-5320-SRB', registrationNumber: 'CRN 14698133', contactName: 'Oliver Grant', email: 'bake@sunrisebakehouse.example', city: 'Richmond', createdAt: at(-2.2 * DAY) },
  { id: 'org-westfield', name: 'Westfield Youth Kitchen', type: 'CommunityKitchen', status: 'Pending', licenseNumber: 'CHY-4502-WYK', registrationNumber: 'CIO 4502117', contactName: 'Jordan Hayes', email: 'youth@westfieldkitchen.example', city: 'London', createdAt: at(-1.1 * DAY) },
  { id: 'org-orchard', name: 'Orchard Lane Growers', type: 'Farm', status: 'Pending', licenseNumber: 'FBO-5377-OLG', registrationNumber: 'CRN 14733590', contactName: 'Freya Collins', email: 'harvest@orchardlane.example', city: 'Kent', createdAt: at(-5) },
]

/** The registry, most recently joined first. */
export function getMockOrganizations(): AdminOrganization[] {
  return [...ORGANIZATIONS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ id, name, type, status, licenseNumber, city, createdAt }) => ({ id, name, type, status, licenseNumber, city, createdAt }))
}

/** Pending organizations as review requests, oldest first (first in, first reviewed). */
export function getMockPendingRequests(): PendingOrganizationRequest[] {
  return ORGANIZATIONS.filter((o) => o.status === 'Pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((o) => ({
      organizationId: o.id,
      organizationName: o.name,
      type: o.type,
      licenseNumber: o.licenseNumber,
      registrationNumber: o.registrationNumber,
      contactName: o.contactName,
      email: o.email,
      city: o.city,
      submittedAt: o.createdAt,
      status: 'Pending',
    }))
}

// ---------------------------------------------------------------- Claims (network-wide)
type ClaimRecord = Omit<AssignableClaim, 'status'> & { status: ClaimStatus }

// Claims between organizations the sample beneficiary / courier never see.
const OTHER_CLAIMS: ClaimRecord[] = [
  { claimId: 'c-3301', donationId: 'd-311', donationTitle: 'Sourdough & rye loaves', quantity: 42, unit: 'items', donorOrganizationName: 'Crumb & Co. Bakery', beneficiaryOrganizationName: 'St Mark’s Night Shelter', pickupAddress: '31 Mill Lane, Old Town', expiresAt: at(2.4), claimedAt: at(-0.4), status: 'Booked' },
  { claimId: 'c-3302', donationId: 'd-312', donationTitle: 'Windfall apples & pears', quantity: 5, unit: 'crates', donorOrganizationName: 'Green Valley Farm', beneficiaryOrganizationName: 'Northside Community Kitchen', pickupAddress: 'Green Valley Farm Shop, Riverside Road', expiresAt: at(30), claimedAt: at(-1.8), status: 'Booked' },
  { claimId: 'c-3303', donationId: 'd-313', donationTitle: 'Chilled ready meals', quantity: 22, unit: 'portions', donorOrganizationName: 'Northside Market', beneficiaryOrganizationName: 'Eastside Community Pantry', pickupAddress: '88 Station Road, Northside', expiresAt: at(9), claimedAt: at(-2.6), status: 'Booked' },
  { claimId: 'c-3304', donationId: 'd-314', donationTitle: 'Tinned pulses & rice', quantity: 30, unit: 'kg', donorOrganizationName: 'Riverside Grocer', beneficiaryOrganizationName: 'St Mark’s Night Shelter', pickupAddress: '5 Towpath Parade, Riverside', expiresAt: at(96), claimedAt: at(-3.1), status: 'Booked' },
  { claimId: 'c-3305', donationId: 'd-301', donationTitle: 'Conference lunch trays', quantity: 60, unit: 'portions', donorOrganizationName: 'Canteen Seven', beneficiaryOrganizationName: 'Northside Community Kitchen', pickupAddress: 'Unit 7, Canal Works, Eastside', expiresAt: at(-40), claimedAt: at(-50), status: 'Closed' },
  { claimId: 'c-3306', donationId: 'd-302', donationTitle: 'Bagels & rolls', quantity: 80, unit: 'items', donorOrganizationName: 'Crumb & Co. Bakery', beneficiaryOrganizationName: 'St Mark’s Night Shelter', pickupAddress: '31 Mill Lane, Old Town', expiresAt: at(-60), claimedAt: at(-70), status: 'Closed' },
  { claimId: 'c-3307', donationId: 'd-303', donationTitle: 'Root vegetable sacks', quantity: 25, unit: 'kg', donorOrganizationName: 'Green Valley Farm', beneficiaryOrganizationName: 'Eastside Community Pantry', pickupAddress: 'Green Valley Farm Shop, Riverside Road', expiresAt: at(-80), claimedAt: at(-96), status: 'Closed' },
  { claimId: 'c-3308', donationId: 'd-304', donationTitle: 'Yogurt multipacks', quantity: 18, unit: 'items', donorOrganizationName: 'Eastside Grocers', beneficiaryOrganizationName: 'Northside Community Kitchen', pickupAddress: '12 Market Row, Eastside', expiresAt: at(-30), claimedAt: at(-36), status: 'Cancelled' },
]

function networkClaims(): ClaimRecord[] {
  const shared = getMockAllClaims().map<ClaimRecord>((c) => ({
    claimId: c.id,
    donationId: c.donationId,
    donationTitle: c.donationTitle,
    quantity: c.quantity,
    unit: c.unit,
    donorOrganizationName: c.donorOrganizationName,
    beneficiaryOrganizationName: c.beneficiaryOrganizationName,
    pickupAddress: c.pickupAddress,
    expiresAt: c.expiresAt,
    claimedAt: c.claimedAt,
    status: c.status,
  }))
  return [...shared, ...OTHER_CLAIMS]
}

/** Booked claims still waiting for a courier, soonest to expire first. */
export function getMockAssignableClaims(): AssignableClaim[] {
  return networkClaims()
    .filter((c): c is AssignableClaim => c.status === 'Booked')
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
}

/** Network claims counted by status (dashboard delivery breakdown). */
export function getMockClaimStatusCounts(): Record<ClaimStatus, number> {
  const counts = { Booked: 0, PickupPending: 0, PickedUp: 0, InTransit: 0, Delivered: 0, Closed: 0, Cancelled: 0, Failed: 0 }
  for (const c of networkClaims()) counts[c.status]++
  return counts
}

// ---------------------------------------------------------------- Couriers
const COURIERS: CourierOption[] = [
  { userId: '3f2b8c1e-5a4d-4e8b-9c1a-7d2e6f0b4a91', fullName: 'Daniel Price', email: 'daniel.price@couriers.example' },
  { userId: '8a1d4f7c-2b3e-4c5d-8e9f-0a1b2c3d4e5f', fullName: 'Leila Haddad', email: 'leila.haddad@couriers.example' },
  { userId: 'c9e0b1a2-7f6d-4a3b-9c8e-5d4f3a2b1c0d', fullName: 'Kwame Asante', email: 'kwame.asante@couriers.example' },
  { userId: '1b7e3a9d-6c2f-4d8a-b5e1-9f0c4a7d2e36', fullName: 'Sofia Marchetti', email: 'sofia.marchetti@couriers.example' },
]

export function getMockCouriers(): CourierOption[] {
  return COURIERS
}

// ---------------------------------------------------------------- Audit log
const ACTORS = {
  admin: { actorName: 'Nadia Karimi', actorUserId: '6d0f9e2a-41c7-4b5e-8a3d-2f1c7b9e0d54' },
  donor: { actorName: 'Amira Haddad', actorUserId: '2c8e5b1f-93a0-4d6e-b7c2-5e1f8a3d9b07' },
  bakery: { actorName: 'Elena Novak', actorUserId: '9a4c2e7b-1d5f-4a8e-9b3c-6f0d2e8a1c75' },
  beneficiary: { actorName: 'Grace Mensah', actorUserId: 'e1b5d8a3-7c2f-4e9a-8d6b-3a0f5c9e2b18' },
  courier: { actorName: 'Daniel Price', actorUserId: COURIERS[0].userId },
  courier2: { actorName: 'Leila Haddad', actorUserId: COURIERS[1].userId },
  millbrook: { actorName: 'Aisha Rahman', actorUserId: '4e7a1c9b-2d8f-4b6a-a3e5-8c0d1f7b2a69' },
  sunrise: { actorName: 'Oliver Grant', actorUserId: 'b3d9f2e6-8a1c-4f7b-9e5d-0c2a6b8f4d13' },
  westfield: { actorName: 'Jordan Hayes', actorUserId: '7f1c5a3e-9b2d-4c8f-a6e0-1d4b7e9c3a28' },
  orchard: { actorName: 'Freya Collins', actorUserId: 'd2a6e8c4-3f9b-4a1d-8c7e-5b0f2d9a6e41' },
} as const

// [hours ago, action code, actor, entity type, entity id] — newest first. No Details payloads.
const AUDIT: [number, string, keyof typeof ACTORS, AuditEntityType, string][] = [
  [0.4, 'ClaimCreated', 'beneficiary', 'Claim', 'c-3301'],
  [0.5, 'PickupVerified', 'courier', 'HandoverCode', 'hc-05'],
  [0.6, 'ClaimCreated', 'beneficiary', 'Claim', 'c-3101'],
  [0.7, 'CourierAssigned', 'admin', 'Claim', 'c-3201'],
  [0.8, 'PickupVerified', 'courier', 'HandoverCode', 'hc-02'],
  [1, 'CourierAssigned', 'admin', 'Claim', 'c-3102'],
  [1.5, 'DonationUpdated', 'donor', 'Donation', 'd-101'],
  [1.8, 'ClaimCreated', 'beneficiary', 'Claim', 'c-3302'],
  [2.4, 'CourierAssigned', 'admin', 'Claim', 'c-3103'],
  [3, 'DonationCreated', 'donor', 'Donation', 'd-101'],
  [3.5, 'CourierAssigned', 'admin', 'Claim', 'c-3104'],
  [5, 'OrganizationRegistered', 'orchard', 'Organization', 'org-orchard'],
  [5.2, 'DonationCreated', 'donor', 'Donation', 'd-102'],
  [6, 'DonationCreated', 'bakery', 'Donation', 'd-202'],
  [9, 'OrganizationSuspended', 'admin', 'Organization', 'org-quaycafe'],
  [22, 'DeliveryVerified', 'courier', 'HandoverCode', 'hc-06'],
  [24.5, 'PickupVerified', 'courier', 'HandoverCode', 'hc-07'],
  [26, 'OrganizationRegistered', 'westfield', 'Organization', 'org-westfield'],
  [28, 'ClaimFailed', 'courier2', 'Claim', 'c-3108'],
  [36, 'ClaimCancelled', 'beneficiary', 'Claim', 'c-3308'],
  [40, 'ClaimClosed', 'admin', 'Claim', 'c-3305'],
  [46, 'DeliveryVerified', 'courier2', 'HandoverCode', 'hc-08'],
  [52, 'OrganizationRegistered', 'sunrise', 'Organization', 'org-sunrise'],
  [60, 'ClaimClosed', 'admin', 'Claim', 'c-3306'],
  [62, 'ClaimClosed', 'admin', 'Claim', 'c-3106'],
  [70, 'ClaimCreated', 'beneficiary', 'Claim', 'c-3306'],
  [80, 'ClaimClosed', 'admin', 'Claim', 'c-3307'],
  [84, 'OrganizationRegistered', 'millbrook', 'Organization', 'org-millbrook'],
  [90, 'ClaimCancelled', 'beneficiary', 'Claim', 'c-3107'],
  [100, 'DonationCancelled', 'donor', 'Donation', 'd-110'],
  [118, 'OrganizationRejected', 'admin', 'Organization', 'org-bigbox'],
  [130, 'OrganizationApproved', 'admin', 'Organization', 'org-stmarks'],
  [140, 'DonationCreated', 'bakery', 'Donation', 'd-207'],
  [150, 'OrganizationRejected', 'admin', 'Organization', 'org-pophall'],
  [158, 'OrganizationSuspended', 'admin', 'Organization', 'org-oldtown'],
  [165, 'OrganizationReactivated', 'admin', 'Organization', 'org-northmarket'],
  [170, 'OrganizationSuspended', 'admin', 'Organization', 'org-northmarket'],
]

/** Audit entries, newest first. */
export function getMockAuditEntries(): AuditEntry[] {
  return AUDIT.map(([hours, action, actor, entityType, entityId], i) => ({
    id: `aud-${String(10480 - i)}`,
    action,
    ...ACTORS[actor],
    entityType,
    entityId,
    timestampUtc: at(-hours),
  }))
}

// ---------------------------------------------------------------- Summary
export function getMockAdminSummary(): AdminDashboardSummary {
  const donations = getMockDonations()
  const claims = getMockClaimStatusCounts()
  return {
    pendingOrganizations: ORGANIZATIONS.filter((o) => o.status === 'Pending').length,
    availableDonations: donations.filter((d) => d.status === 'Available').length,
    closedDeliveries: claims.Closed,
    cancelledClaims: claims.Cancelled,
    expiredDonations: donations.filter((d) => d.status === 'Expired').length,
  }
}
