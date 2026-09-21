// Domain types for donations. Shaped after the FoodLoop API's donation DTO so R6 can map 1:1.
// Dates are ISO-8601 strings, exactly as they arrive over JSON.

export const DONATION_STATUSES = [
  'Draft',
  'Available',
  'Claimed',
  'PickupPending',
  'PickedUp',
  'InTransit',
  'Delivered',
  'Closed',
  'Expired',
  'Cancelled',
  'Failed',
] as const
export type DonationStatus = (typeof DONATION_STATUSES)[number]

export const FOOD_CATEGORIES = ['Produce', 'Bakery', 'PreparedMeals', 'Dairy', 'Pantry', 'Mixed'] as const
export type FoodCategory = (typeof FOOD_CATEGORIES)[number]

export const QUANTITY_UNITS = ['kg', 'items', 'portions', 'crates', 'litres'] as const
export type QuantityUnit = (typeof QUANTITY_UNITS)[number]

export type Donation = {
  id: string
  title: string
  description: string
  category: FoodCategory
  quantity: number
  unit: QuantityUnit
  expiresAt: string
  pickupAddress: string
  status: DonationStatus
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt: string
  /** Optional listing photo (local asset URL). Falls back to the category's media slot. */
  imageUrl?: string
}

/** The editable subset — what Create / Edit submit. */
export type DonationDraft = Pick<
  Donation,
  'title' | 'category' | 'quantity' | 'unit' | 'expiresAt' | 'pickupAddress' | 'description'
>
