// Domain types for organizations. Shaped after the FoodLoop API's organization DTO.

export const ORGANIZATION_STATUSES = ['Active', 'Pending', 'Suspended', 'Rejected'] as const
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number]

export type OrganizationType = 'Restaurant' | 'Bakery' | 'Grocery' | 'Caterer' | 'Farm' | 'FoodBank' | 'CommunityKitchen'

export type Organization = {
  id: string
  name: string
  type: OrganizationType
  status: OrganizationStatus
  licenseNumber: string
  registrationNumber: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  description: string
  website?: string
  createdAt: string
  /** Set once an admin approves the organization. */
  verifiedAt?: string
}
