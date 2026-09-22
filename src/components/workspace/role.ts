// Workspace role for pages inside the shell, taken from the real session. Not authorization: the API decides.
// SAMPLE_ORGANIZATION_IDS is still-mock feature data: which sample organization's records a page lists
// until that feature's API slice replaces it.
import { createContext, useContext } from 'react'
import type { WorkspaceRole } from '../../app/routes'
import { SAMPLE_BENEFICIARY, getCurrentMockOrganization } from '../../data/mock/organization'

export const SAMPLE_ORGANIZATION_IDS: Partial<Record<WorkspaceRole, string>> = {
  donor: getCurrentMockOrganization().id,
  beneficiary: SAMPLE_BENEFICIARY.id,
}

export const WorkspaceRoleContext = createContext<WorkspaceRole>('beneficiary')
export const useWorkspaceRole = () => useContext(WorkspaceRoleContext)
