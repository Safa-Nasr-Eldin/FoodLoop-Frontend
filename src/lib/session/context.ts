// Real signed-in state from GET /api/auth/session. Held in React state only: a refresh recovers it from the
// HttpOnly Identity cookie, never from browser storage. Role checks here shape navigation — the API authorizes.
import { createContext, useContext } from 'react'
import { PATHS, WORKSPACE_ROLES, type WorkspaceRole } from '../../app/routes'
import type { AuthenticatedSession } from '../api/auth'

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; session: AuthenticatedSession }

export type SessionContextValue = {
  state: SessionState
  login: (email: string, password: string) => Promise<AuthenticatedSession>
  logout: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside <SessionProvider>.')
  return value
}

/** The workspace a session belongs to (accounts hold one role). */
export const workspaceRoleOf = (session: AuthenticatedSession): WorkspaceRole | undefined =>
  WORKSPACE_ROLES.find((r) => session.roles.some((role) => role.toLowerCase() === r.id))?.id

export const homeOf = (session: AuthenticatedSession) =>
  WORKSPACE_ROLES.find((r) => r.id === workspaceRoleOf(session))?.home ?? PATHS.home
