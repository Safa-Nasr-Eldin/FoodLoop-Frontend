// MOCK DATA BOUNDARY — the sample courier's assigned tasks. R6 replaces these functions with API calls.
// Shipment details come from the claim; nextStep and evidence are stored per task, never derived.
import type { CourierTask } from '../../types/handover'
import { getMockClaimById } from './claims'

const HOUR = 3_600_000
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()

type TaskRecord = Pick<CourierTask, 'id' | 'claimId' | 'assignedAt' | 'nextStep' | 'evidence'>

const TASKS: TaskRecord[] = [
  { id: 't-5201', claimId: 'c-3201', assignedAt: at(-0.7), nextStep: 'VerifyPickup', evidence: [] },
  { id: 't-5102', claimId: 'c-3102', assignedAt: at(-1), nextStep: 'CollectPickupCode', evidence: [] },
  {
    id: 't-5103',
    claimId: 'c-3103',
    assignedAt: at(-2.4),
    nextStep: 'ProceedToBeneficiary',
    evidence: [{ type: 'Pickup', verifiedAt: at(-0.5) }],
  },
  {
    id: 't-5104',
    claimId: 'c-3104',
    assignedAt: at(-3),
    nextStep: 'VerifyDelivery',
    evidence: [{ type: 'Pickup', verifiedAt: at(-0.8) }],
  },
  {
    id: 't-5105',
    claimId: 'c-3105',
    assignedAt: at(-27),
    nextStep: 'Completed',
    evidence: [
      { type: 'Pickup', verifiedAt: at(-24.5) },
      { type: 'Delivery', verifiedAt: at(-22) },
    ],
  },
]

function toTask(t: TaskRecord): CourierTask {
  const c = getMockClaimById(t.claimId)!
  return {
    ...t,
    status: c.status,
    donationTitle: c.donationTitle,
    category: c.category,
    quantity: c.quantity,
    unit: c.unit,
    expiresAt: c.expiresAt,
    donorOrganizationName: c.donorOrganizationName,
    pickupAddress: c.pickupAddress,
    beneficiaryOrganizationName: c.beneficiaryOrganizationName,
  }
}

export function getMockCourierTasks(): CourierTask[] {
  return TASKS.map(toTask)
}

export function getMockCourierTaskById(id: string): CourierTask | undefined {
  const t = TASKS.find((x) => x.id === id)
  return t && toTask(t)
}
