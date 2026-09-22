import { motion } from 'framer-motion'
import { Info, Search, X } from 'lucide-react'
import { useState } from 'react'
import { PATHS } from '../../app/routes'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/StatusChip'
import { getMockOrganizations } from '../../data/mock/admin'
import { cn } from '../../lib/cn'
import { spring } from '../../lib/motion'
import { useMediaQuery } from '../../lib/useMediaQuery'
import type { AdminOrganization } from '../../types/admin'
import { ORGANIZATION_STATUSES, ORGANIZATION_TYPE_LABELS, type OrganizationStatus } from '../../types/organization'
import { AdminIntro, Pagination } from './kit'
import { ORG_ACTION, ORG_STATUS_TONE, formatDate, paginate, useQueryParams } from './presentation'

const PAGE_SIZE = 8
const isStatus = (v: string | null): v is OrganizationStatus => ORGANIZATION_STATUSES.includes(v as OrganizationStatus)

type Notice = { id: string; text: string }

export function ManageOrganizations() {
  const organizations = getMockOrganizations()
  const desktop = useMediaQuery('(min-width: 1024px)')
  const [params, update] = useQueryParams()
  const [notice, setNotice] = useState<Notice | null>(null)

  const rawStatus = params.get('status')
  const status = isStatus(rawStatus) ? rawStatus : null
  const query = params.get('q') ?? ''
  const needle = query.trim().toLowerCase()

  const filtered = organizations.filter(
    (o) => (!status || o.status === status) && (!needle || o.name.toLowerCase().includes(needle)),
  )
  const { page, pages, items, from } = paginate(filtered, Number(params.get('page')), PAGE_SIZE)
  const count = (s: OrganizationStatus | null) => (s ? organizations.filter((o) => o.status === s).length : organizations.length)

  // Prototype: acknowledge the action locally. Status never changes.
  function act(o: AdminOrganization, action: 'Suspend' | 'Reactivate') {
    const done = action === 'Suspend' ? 'suspended' : 'reactivated'
    setNotice({ id: o.id, text: `Prototype only — ${o.name} was not ${done}. No request was sent.` })
  }

  const rowAction = (o: AdminOrganization) => {
    const action = ORG_ACTION[o.status]
    if (action)
      return (
        <Button variant={action === 'Suspend' ? 'outline' : 'secondary'} size="sm" className="org-action" onClick={() => act(o, action)}>
          {action}
          <span className="visually-hidden"> {o.name}</span>
        </Button>
      )
    if (o.status === 'Pending')
      return (
        <Button variant="ghost" size="sm" className="org-action" to={PATHS.adminPending}>
          Review<span className="visually-hidden"> {o.name} in the pending queue</span>
        </Button>
      )
    return <span className="org-action--none">No action</span>
  }

  return (
    <div className="container ws-page adm">
      <AdminIntro
        code="ADM-02"
        title={
          <>
            Manage <em>organizations</em>
          </>
        }
        lead="The registry of every donor and beneficiary on FoodLoop. Suspend an organization to pause its activity, or reactivate it once resolved."
        aside={
          <dl className="readout">
            {ORGANIZATION_STATUSES.map((s) => (
              <div key={s} className={cn(s === 'Pending' && count(s) > 0 && 'is-warn')}>
                <dt>{s}</dt>
                <dd>{String(count(s)).padStart(2, '0')}</dd>
              </div>
            ))}
          </dl>
        }
        meta={['Registry', `${organizations.length} records`, `${PAGE_SIZE} per page`]}
      />

      <div className="adm-toolbar">
        <form role="search" className="adm-search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="org-q" className="visually-hidden">
            Search organizations by name
          </label>
          <Search aria-hidden="true" />
          <input
            id="org-q"
            type="search"
            className="adm-input"
            placeholder="Search by organization name"
            autoComplete="off"
            value={query}
            onChange={(e) => update({ q: e.target.value, page: null })}
          />
        </form>

        <div className="adm-seg" role="group" aria-label="Filter by status">
          {[null, ...ORGANIZATION_STATUSES].map((s) => {
            const active = s === status
            return (
              <button
                key={s ?? 'all'}
                type="button"
                className="adm-seg__btn"
                aria-pressed={active}
                onClick={() => update({ status: s, page: null })}
              >
                {active && <motion.span layoutId="org-filter" className="adm-seg__indicator" transition={spring.indicator} />}
                <span className="adm-seg__label">{s ?? 'All'}</span>
                <span className="adm-seg__count">
                  {count(s)}
                  <span className="visually-hidden"> organizations</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section aria-labelledby="org-results" id="org-region">
        <div className="adm-resultline">
          <h2 id="org-results" className="adm-resultline__title">
            {status ? `${status} organizations` : 'All organizations'}
          </h2>
          <p className="adm-resultline__count" role="status">
            {filtered.length
              ? `Showing ${from}–${from + items.length - 1} of ${filtered.length}`
              : 'No matching organizations'}
          </p>
        </div>

        <div className="adm-notice" role="status">
          {notice && (
            <p className="ws-notice">
              <Info aria-hidden="true" />
              {notice.text}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="ws-empty adm-empty">
            <h3>No organizations match.</h3>
            <p>
              Nothing {status ? `with status ${status.toLowerCase()}` : 'in the registry'}
              {needle ? ` matches “${query}”` : ''}.
            </p>
            <Button variant="outline" iconStart={<X />} onClick={() => update({ q: null, status: null, page: null })}>
              Clear search and filter
            </Button>
          </div>
        ) : desktop ? (
          <div className="ledger-frame">
            <table className="ledger">
              <caption className="visually-hidden">
                Organizations{status ? ` with status ${status}` : ''}, page {page} of {pages}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Organization</th>
                  <th scope="col">Type</th>
                  <th scope="col">License / reference</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                  <th scope="col" className="num">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} data-status={o.status} className={cn(notice?.id === o.id && 'is-flagged')}>
                    <th scope="row" className="ledger__rowhead">
                      <span className="ledger__primary">
                        <strong>{o.name}</strong>
                        <span className="ledger__sub">{o.id}</span>
                      </span>
                    </th>
                    <td>
                      {ORGANIZATION_TYPE_LABELS[o.type]}
                      <span className="ledger__sub ledger__sub--plain">{o.city}</span>
                    </td>
                    <td>
                      <code className="ledger__mono">{o.licenseNumber}</code>
                    </td>
                    <td>
                      <StatusChip tone={ORG_STATUS_TONE[o.status]}>{o.status}</StatusChip>
                    </td>
                    <td>
                      <time dateTime={o.createdAt} className="ledger__mono">
                        {formatDate(o.createdAt)}
                      </time>
                    </td>
                    <td className="num">{rowAction(o)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul role="list" className="records">
            {items.map((o) => (
              <li key={o.id} className={cn('record', notice?.id === o.id && 'is-flagged')} data-status={o.status}>
                <div className="record__head">
                  <h3 className="record__title">{o.name}</h3>
                  <StatusChip tone={ORG_STATUS_TONE[o.status]}>{o.status}</StatusChip>
                </div>
                <dl className="record__facts">
                  <div>
                    <dt>Type</dt>
                    <dd>{ORGANIZATION_TYPE_LABELS[o.type]}</dd>
                  </div>
                  <div>
                    <dt>Joined</dt>
                    <dd>
                      <time dateTime={o.createdAt}>{formatDate(o.createdAt)}</time>
                    </dd>
                  </div>
                  <div>
                    <dt>License</dt>
                    <dd>
                      <code>{o.licenseNumber}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>ID</dt>
                    <dd>
                      <code>{o.id}</code>
                    </dd>
                  </div>
                </dl>
                {rowAction(o)}
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} pages={pages} label="Organizations" targetId="org-region" onPage={(n) => update({ page: String(n) })} />
      </section>
    </div>
  )
}
