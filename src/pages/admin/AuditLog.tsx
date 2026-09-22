import { AlertCircle, Search } from 'lucide-react'
import { useMemo } from 'react'
import { getMockAuditEntries } from '../../data/mock/admin'
import { cn } from '../../lib/cn'
import { formatAgo } from '../../lib/expiry'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { AdminIntro, Pagination } from './kit'
import { formatUtc, paginate, useQueryParams } from './presentation'
import './audit.css'

const PAGE_SIZE = 10

/** yyyy-mm-dd (UTC) for the date inputs and comparisons — audit timestamps are UTC throughout. */
const utcDateKey = (iso: string) => iso.slice(0, 10)

export function AuditLog() {
  const entries = getMockAuditEntries()
  const desktop = useMediaQuery('(min-width: 900px)')
  const [params, update] = useQueryParams()

  const action = params.get('action') ?? ''
  const actor = params.get('actor') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''

  const actions = useMemo(() => [...new Set(entries.map((e) => e.action))].sort(), [entries])
  const actors = useMemo(() => [...new Set(entries.map((e) => e.actorName))].sort(), [entries])

  const rangeInvalid = !!from && !!to && from > to

  const filtered = entries.filter((e) => {
    if (action && e.action !== action) return false
    if (actor && e.actorName !== actor) return false
    if (!rangeInvalid) {
      const key = utcDateKey(e.timestampUtc)
      if (from && key < from) return false
      if (to && key > to) return false
    }
    return true
  })
  const { page, pages, items, from: startIdx } = paginate(filtered, Number(params.get('page')), PAGE_SIZE)
  const anyFilter = !!(action || actor || from || to)

  return (
    <div className="container ws-page adm">
      <AdminIntro
        code="ADM-05"
        title={
          <>
            Audit <em>log</em>
          </>
        }
        lead="Every recorded action on the network, newest first. Filter by action, actor or date range."
        meta={[`${entries.length} entries`, 'UTC timestamps', 'Details payload not shown']}
      />

      <div className="adm-toolbar audit-filters">
        <div className="adm-field">
          <label htmlFor="audit-action" className="visually-hidden">
            Filter by action
          </label>
          <select id="audit-action" className="adm-select" value={action} onChange={(e) => update({ action: e.target.value || null, page: null })}>
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-field">
          <label htmlFor="audit-actor" className="visually-hidden">
            Filter by actor
          </label>
          <select id="audit-actor" className="adm-select" value={actor} onChange={(e) => update({ actor: e.target.value || null, page: null })}>
            <option value="">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-field audit-daterange">
          <label htmlFor="audit-from" className="visually-hidden">
            From date (UTC)
          </label>
          <input
            id="audit-from"
            type="date"
            className="adm-input"
            aria-invalid={rangeInvalid || undefined}
            value={from}
            onChange={(e) => update({ from: e.target.value || null, page: null })}
          />
          <span className="audit-daterange__sep" aria-hidden="true">
            –
          </span>
          <label htmlFor="audit-to" className="visually-hidden">
            To date (UTC)
          </label>
          <input
            id="audit-to"
            type="date"
            className="adm-input"
            aria-invalid={rangeInvalid || undefined}
            value={to}
            onChange={(e) => update({ to: e.target.value || null, page: null })}
          />
        </div>

        {anyFilter && (
          <button type="button" className="audit-clear" onClick={() => update({ action: null, actor: null, from: null, to: null, page: null })}>
            Clear filters
          </button>
        )}
      </div>

      <div role="alert" className="adm-notice">
        {rangeInvalid && (
          <p className="ws-notice ws-notice--warning">
            <AlertCircle aria-hidden="true" />
            The “from” date is after the “to” date, so no date filter is applied. Adjust the range to filter by date.
          </p>
        )}
      </div>

      <section aria-labelledby="audit-results" id="audit-region">
        <div className="adm-resultline">
          <h2 id="audit-results" className="adm-resultline__title">
            {anyFilter ? 'Filtered entries' : 'All entries'}
          </h2>
          <p className="adm-resultline__count" role="status">
            {filtered.length ? `Showing ${startIdx}–${startIdx + items.length - 1} of ${filtered.length}` : 'No matching entries'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="ws-empty adm-empty">
            <Search aria-hidden="true" />
            <h3>No entries match.</h3>
            <p>Try a different action, actor or date range.</p>
          </div>
        ) : desktop ? (
          <div className="ledger-frame">
            <table className="ledger audit-ledger">
              <caption className="visually-hidden">
                Audit log, page {page} of {pages}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Timestamp (UTC)</th>
                  <th scope="col">Action</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Entity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <th scope="row" className="ledger__rowhead">
                      <time dateTime={e.timestampUtc} className="ledger__mono">
                        {formatUtc(e.timestampUtc)}
                      </time>
                    </th>
                    <td>
                      <code className="audit-action">{e.action}</code>
                    </td>
                    <td>
                      <span className="ledger__primary">
                        {e.actorName}
                        <span className="ledger__sub">
                          <span className="id-trunc" title={e.actorUserId}>
                            {e.actorUserId}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>
                      {e.entityType}
                      <code className="ledger__mono ledger__sub--plain">{e.entityId}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul role="list" className="records">
            {items.map((e) => (
              <li key={e.id} className="record">
                <div className="record__head">
                  <code className="audit-action">{e.action}</code>
                  <time dateTime={e.timestampUtc} className="record__time">
                    {formatAgo(e.timestampUtc)}
                  </time>
                </div>
                <dl className="record__facts">
                  <div>
                    <dt>Actor</dt>
                    <dd>{e.actorName}</dd>
                  </div>
                  <div>
                    <dt>Entity</dt>
                    <dd>{e.entityType}</dd>
                  </div>
                  <div className="span-2">
                    <dt>Entity ID</dt>
                    <dd>
                      <code>{e.entityId}</code>
                    </dd>
                  </div>
                  <div className="span-2">
                    <dt>Timestamp (UTC)</dt>
                    <dd>
                      <code>{formatUtc(e.timestampUtc)}</code>
                    </dd>
                  </div>
                  <div className="span-2">
                    <dt>Actor user ID</dt>
                    <dd className={cn('id-trunc')} title={e.actorUserId}>
                      <code>{e.actorUserId}</code>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} pages={pages} label="Audit entries" targetId="audit-region" onPage={(n) => update({ page: String(n) })} />
      </section>
    </div>
  )
}
