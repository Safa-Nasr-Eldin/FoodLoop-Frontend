// Admin presentation: tones, labels, formatting, paging. Reads what the (mock) API says; decides nothing.
import { useSearchParams } from 'react-router-dom'
import type { StatusTone } from '../../components/ui/StatusChip'
import type { OrganizationStatus } from '../../types/organization'

export const ORG_STATUS_TONE: Record<OrganizationStatus, StatusTone> = {
  Active: 'success',
  Pending: 'warning',
  Suspended: 'danger',
  Rejected: 'neutral',
}

/** Prototype stand-in for the API's permission flags: which admin action a row offers. */
export const ORG_ACTION: Partial<Record<OrganizationStatus, 'Suspend' | 'Reactivate'>> = {
  Active: 'Suspend',
  Suspended: 'Reactivate',
}

export const PROTOTYPE_NOTE = 'Prototype only — no request was sent.'

const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))

/** "2026-09-22 14:03:11" — audit timestamps read in UTC, second precision. */
export const formatUtc = (iso: string) => iso.slice(0, 19).replace('T', ' ')

/** "14:03" in UTC, for compact activity rows. */
export const formatUtcTime = (iso: string) => iso.slice(11, 16)

/** Whole days since an ISO timestamp (0 = today). */
export const daysSince = (iso: string, now = Date.now()) => Math.floor((now - new Date(iso).getTime()) / 86_400_000)

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** Deterministic client-side paging. Out-of-range pages clamp to the nearest real page. */
export function paginate<T>(items: T[], requested: number, size: number) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const page = Math.min(Math.max(1, requested || 1), pages)
  return { page, pages, items: items.slice((page - 1) * size, page * size), from: (page - 1) * size + 1 }
}

/** Filters kept in the URL (as Marketplace does), so back/forward and reloads restore them. */
export function useQueryParams() {
  const [params, setParams] = useSearchParams()
  function update(patch: Record<string, string | null>) {
    // Read the live URL: the router's `prev` can be stale when two updates land in quick succession.
    const next = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return [params, update] as const
}
