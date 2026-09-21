// UI presentation for donation enums: labels, tones, groupings. No lifecycle rules live here.
import { Carrot, CookingPot, Milk, Package, ShoppingBasket, Wheat, type LucideIcon } from 'lucide-react'
import type { CategoryMediaSlot } from '../../data/categoryMedia'
import type { Donation, DonationStatus, FoodCategory } from '../../types/donation'
import type { StatusTone } from '../ui/StatusChip'

export type StatusPhase = 'draft' | 'open' | 'progress' | 'done' | 'ended'

export const STATUS_META: Record<DonationStatus, { label: string; tone: StatusTone; phase: StatusPhase }> = {
  Draft: { label: 'Draft', tone: 'neutral', phase: 'draft' },
  Available: { label: 'Available', tone: 'success', phase: 'open' },
  Claimed: { label: 'Claimed', tone: 'info', phase: 'progress' },
  PickupPending: { label: 'Pickup pending', tone: 'warning', phase: 'progress' },
  PickedUp: { label: 'Picked up', tone: 'info', phase: 'progress' },
  InTransit: { label: 'In transit', tone: 'info', phase: 'progress' },
  Delivered: { label: 'Delivered', tone: 'complete', phase: 'done' },
  Closed: { label: 'Closed', tone: 'complete', phase: 'done' },
  Expired: { label: 'Expired', tone: 'danger', phase: 'ended' },
  Cancelled: { label: 'Cancelled', tone: 'neutral', phase: 'ended' },
  Failed: { label: 'Failed', tone: 'danger', phase: 'ended' },
}

export const CATEGORY_META: Record<FoodCategory, { label: string; slot: CategoryMediaSlot; icon: LucideIcon }> = {
  Produce: { label: 'Produce', slot: 'produce', icon: Carrot },
  Bakery: { label: 'Bakery', slot: 'bakery', icon: Wheat },
  PreparedMeals: { label: 'Prepared meals', slot: 'preparedMeals', icon: CookingPot },
  Dairy: { label: 'Dairy', slot: 'dairy', icon: Milk },
  Pantry: { label: 'Pantry', slot: 'pantry', icon: Package },
  Mixed: { label: 'Mixed', slot: 'mixed', icon: ShoppingBasket },
}

/** Prototype stand-in for the API's permission check: only unclaimed listings can be edited. */
export const isEditable = (d: Pick<Donation, 'status'>) => d.status === 'Draft' || d.status === 'Available'

export const formatQuantity = (d: Pick<Donation, 'quantity' | 'unit'>) => `${d.quantity} ${d.unit}`

/** Neighbourhood shown on cards: the last part of the pickup address ("14 Harbour Street, Harbourside" → "Harbourside"). */
export const pickupAreaOf = (d: Pick<Donation, 'pickupAddress'>) => d.pickupAddress.split(',').at(-1)?.trim() || '—'
