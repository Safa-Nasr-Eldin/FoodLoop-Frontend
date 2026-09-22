// Sample-role plumbing for the workspace prototype. Not authorization: it only picks nav, profile and
// whose handover codes to list. R6 replaces it with the signed-in user's real role.
import { createContext, useContext } from 'react'
import type { WorkspaceRole } from '../../app/routes'
import { SAMPLE_BENEFICIARY, getCurrentMockOrganization } from '../../data/mock/organization'

export const SAMPLE_PROFILES: Record<WorkspaceRole, { person: string; organizationId?: string; organizationName: string }> = {
  donor: {
    person: getCurrentMockOrganization().contactName,
    organizationId: getCurrentMockOrganization().id,
    organizationName: getCurrentMockOrganization().name,
  },
  beneficiary: { person: 'Grace Mensah', organizationId: SAMPLE_BENEFICIARY.id, organizationName: SAMPLE_BENEFICIARY.name },
  courier: { person: 'Daniel Price', organizationName: 'Volunteer courier' },
}

/** Role a page belongs to on its own; shared pages (marketplace, handover codes) return undefined. */
export function roleOfPath(pathname: string): WorkspaceRole | undefined {
  if (pathname.startsWith('/courier')) return 'courier'
  if (pathname.startsWith('/claims')) return 'beneficiary'
  if (pathname.startsWith('/donations') || pathname.startsWith('/organization')) return 'donor'
  return undefined
}

export const WorkspaceRoleContext = createContext<WorkspaceRole>('beneficiary')
export const useWorkspaceRole = () => useContext(WorkspaceRoleContext)
