import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { apiFetchAuth } from '../../../lib/api'
import { NewQuoteWireframeForm } from './NewQuoteWireframeForm'
import type { QuoteStatusId } from './quoteTypes'
import { QUOTE_STATUS_TABS } from './quoteTypes'

const inputClass =
  'h-11 w-full rounded-xl border border-white/20 bg-black px-3 text-sm text-white placeholder:text-gray-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40'

function SelectField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <select id={id} className={inputClass}>
        {children}
      </select>
    </div>
  )
}

function DateRangeRow({
  prefix,
  title,
}: {
  prefix: string
  title: string
}) {
  return (
    <div className="col-span-full grid gap-4 border-t border-white/10 pt-4 md:col-span-2 lg:col-span-4 lg:grid-cols-4">
      <p className="font-medium text-gray-300 lg:col-span-4">{title}</p>
      <Input id={`${prefix}-from`} label={`${title} from`} type="date" />
      <Input id={`${prefix}-to`} label={`${title} to`} type="date" />
    </div>
  )
}

function CheckboxRow({ id, label }: { id: string; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
      <input id={id} type="checkbox" className="h-4 w-4 rounded border-white/30 bg-black text-brand-yellow focus:ring-brand-yellow/40" />
      {label}
    </label>
  )
}

/** Full cross-status quote search — default tab “Search quotes”. */
function SearchQuotesForm({ onHideFilter }: { onHideFilter: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" className="text-brand-yellow underline-offset-2 hover:underline">
            Print
          </button>
          <span className="text-gray-600">|</span>
          <button type="button" className="text-brand-yellow underline-offset-2 hover:underline">
            Export
          </button>
        </div>
        <button
          type="button"
          onClick={onHideFilter}
          className="text-sm text-gray-400 underline-offset-2 hover:text-white hover:underline"
        >
          Hide search filter
        </button>
      </div>

      <Input id="q-ref" label="Quote ref" placeholder="Reference" />
      <Input id="q-customer" label="Customer" placeholder="Name or company" />
      <Input id="q-project" label="Project" placeholder="Project" />
      <Input id="q-keywords" label="Keywords" placeholder="Search text" />
      <Input id="q-tag" label="Tag" placeholder="Tag" />
      <Input id="q-region" label="Region" placeholder="Region" />
      <Input id="q-status" label="Status" placeholder="Status" />

      <SelectField id="q-type" label="Quote type">
        <option value="">Any</option>
        <option value="standard">Standard</option>
        <option value="variation">Variation</option>
      </SelectField>
      <SelectField id="q-source" label="Quote source">
        <option value="">Any</option>
        <option value="web">Web</option>
        <option value="phone">Phone</option>
        <option value="partner">Partner</option>
      </SelectField>
      <SelectField id="q-created" label="Created by">
        <option value="">Anyone</option>
        <option value="me">Me</option>
        <option value="team">My team</option>
      </SelectField>

      <DateRangeRow prefix="q-date" title="Date" />
      <DateRangeRow prefix="q-expiry" title="Expiry date" />
      <DateRangeRow prefix="q-accepted" title="Accepted date" />
      <DateRangeRow prefix="q-rejected" title="Rejected date" />
      <DateRangeRow prefix="q-converted" title="Converted date" />

      <div className="col-span-full flex flex-wrap gap-6 pt-2">
        <CheckboxRow id="q-from-leads" label="From leads" />
        <CheckboxRow id="q-custom-fields" label="Show custom field filter" />
      </div>

      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search</Button>
      </div>
    </div>
  )
}

type QuoteListRow = {
  _id: string
  quoteRef: string
  quoteId: string
  status: string
  shortDescription: string
  typeOfQuote?: string
  updatedAt?: string
  createdAt?: string
  estimatedQuoteTotal: number | null
  estimateRange: string | null
  estimateLabel: string | null
  clientCompany: string
  clientContact: string
}

const TYPE_OF_QUOTE_LABEL: Record<string, string> = {
  to_be_determined: 'To be determined',
  desktop: 'Desktop',
  attend: 'Attend',
  supply_chain: 'Supply Chain',
}

function formatGBP(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

function DraftQuotesList({ listKey }: { listKey: number }) {
  const [quotes, setQuotes] = useState<QuoteListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetchAuth<{ quotes: QuoteListRow[] }>('/api/newquote-api/quotes?status=draft')
        if (!cancelled) setQuotes(data.quotes || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load drafts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [listKey])

  if (loading) {
    return <p className="col-span-full text-sm text-gray-400">Loading draft quotes…</p>
  }
  if (error) {
    return (
      <p className="col-span-full text-sm text-red-300" role="alert">
        {error}
      </p>
    )
  }
  if (quotes.length === 0) {
    return (
      <p className="col-span-full text-sm text-gray-400">
        No draft quotes in MongoDB yet. Save one from the <span className="text-brand-yellow">New quote</span> tab.
      </p>
    )
  }

  return (
    <div className="col-span-full overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm text-gray-200">
        <thead>
          <tr className="border-b border-white/10 bg-black/60 text-xs uppercase tracking-wider text-gray-400">
            <th className="px-3 py-2 font-medium">Quote ref</th>
            <th className="px-3 py-2 font-medium">Customer</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium">Est. price</th>
            <th className="px-3 py-2 font-medium">Catalogue match</th>
            <th className="px-3 py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q._id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-3 py-2 font-mono text-brand-yellow/90">{q.quoteRef}</td>
              <td className="px-3 py-2">
                {q.clientCompany || '—'}
                {q.clientContact ? (
                  <span className="block text-xs text-gray-500">{q.clientContact}</span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-xs text-gray-400">
                {(q.typeOfQuote && TYPE_OF_QUOTE_LABEL[q.typeOfQuote]) || q.typeOfQuote || '—'}
              </td>
              <td className="max-w-[240px] truncate px-3 py-2 text-gray-300" title={q.shortDescription}>
                {q.shortDescription || '—'}
              </td>
              <td className="px-3 py-2">
                <span className="font-medium text-white">{formatGBP(q.estimatedQuoteTotal)}</span>
                {q.estimateRange ? (
                  <span className="mt-0.5 block text-xs text-gray-500">Band {q.estimateRange}</span>
                ) : null}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-xs text-gray-400" title={q.estimateLabel || ''}>
                {q.estimateLabel || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                {q.updatedAt ? new Date(q.updatedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DraftsSearchForm({ listKey }: { listKey: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <p className="col-span-full text-sm text-gray-400">
        Draft-specific filters (wireframe). Below: live draft quotes from MongoDB including estimated price when the
        pricing API has been run.
      </p>
      <Input id="d-autosave" label="Autosave version" placeholder="e.g. v3" />
      <Input id="d-editor" label="Last edited by" placeholder="User" />
      <SelectField id="d-template" label="Draft template">
        <option value="">Any template</option>
        <option value="blank">Blank</option>
        <option value="maintenance">Maintenance</option>
      </SelectField>
      <DateRangeRow prefix="d-saved" title="Last saved" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search drafts</Button>
      </div>

      <h3 className="col-span-full mt-6 border-t border-white/10 pt-6 text-sm font-semibold uppercase tracking-wide text-brand-yellow/90">
        Draft quotes
      </h3>
      <DraftQuotesList listKey={listKey} />
    </div>
  )
}

function ConvertedSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <p className="col-span-full text-sm text-gray-400">
        Find quotes already converted — different fields than the default quote search.
      </p>
      <Input id="c-job" label="Job / work order ref" placeholder="JOB-…" />
      <Input id="c-converter" label="Converted by" placeholder="User" />
      <SelectField id="c-handoff" label="Handoff status">
        <option value="">Any</option>
        <option value="pending">Pending handoff</option>
        <option value="complete">Complete</option>
      </SelectField>
      <DateRangeRow prefix="c-conv" title="Converted date" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search converted</Button>
      </div>
    </div>
  )
}

function ActionedSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input id="a-owner" label="Action owner" placeholder="User or group" />
      <SelectField id="a-priority" label="Priority">
        <option value="">Any</option>
        <option value="p1">P1</option>
        <option value="p2">P2</option>
      </SelectField>
      <DateRangeRow prefix="a-due" title="Due date" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search actioned</Button>
      </div>
    </div>
  )
}

function CallbackSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Input id="cb-phone" label="Callback number" placeholder="+44 …" />
      <SelectField id="cb-slot" label="Preferred slot">
        <option value="">Any</option>
        <option value="am">AM</option>
        <option value="pm">PM</option>
      </SelectField>
      <DateRangeRow prefix="cb-sched" title="Scheduled callback" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search callbacks</Button>
      </div>
    </div>
  )
}

function AcceptedSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Input id="acc-po" label="PO / contract ref" placeholder="PO-…" />
      <Input id="acc-value-min" label="Min value (£)" type="number" placeholder="0" />
      <Input id="acc-value-max" label="Max value (£)" type="number" placeholder="0" />
      <DateRangeRow prefix="acc-signed" title="Signed date" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search accepted</Button>
      </div>
    </div>
  )
}

function RejectedSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SelectField id="rej-reason" label="Rejection category">
        <option value="">Any</option>
        <option value="price">Price</option>
        <option value="scope">Scope</option>
        <option value="timing">Timing</option>
      </SelectField>
      <Input id="rej-competitor" label="Lost to (optional)" placeholder="Competitor" />
      <DateRangeRow prefix="rej" title="Rejected date" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search rejected</Button>
      </div>
    </div>
  )
}

function SalesAppointmentSearchForm() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Input id="sa-assignee" label="Assignee" placeholder="Rep name" />
      <SelectField id="sa-location" label="Location type">
        <option value="">Any</option>
        <option value="site">On site</option>
        <option value="remote">Remote</option>
      </SelectField>
      <DateRangeRow prefix="sa-appt" title="Appointment date" />
      <div className="col-span-full flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Clear
        </Button>
        <Button type="button">Search appointments</Button>
      </div>
    </div>
  )
}

function QuoteFormBody({
  active,
  onHideFilter,
  onQuoteCreated,
  draftListKey,
}: {
  active: QuoteStatusId
  onHideFilter: () => void
  onQuoteCreated?: () => void
  draftListKey: number
}) {
  switch (active) {
    case 'search':
      return <SearchQuotesForm onHideFilter={onHideFilter} />
    case 'new':
      return <NewQuoteWireframeForm onQuoteCreated={onQuoteCreated} />
    case 'drafts':
      return <DraftsSearchForm listKey={draftListKey} />
    case 'converted':
      return <ConvertedSearchForm />
    case 'actioned':
      return <ActionedSearchForm />
    case 'callback':
      return <CallbackSearchForm />
    case 'accepted':
      return <AcceptedSearchForm />
    case 'rejected':
      return <RejectedSearchForm />
    case 'sales_appointment':
      return <SalesAppointmentSearchForm />
    default:
      return <SearchQuotesForm onHideFilter={onHideFilter} />
  }
}

export const QuotesWorkspace = () => {
  const [activeStatus, setActiveStatus] = useState<QuoteStatusId>('search')
  const [counts, setCounts] = useState<Partial<Record<QuoteStatusId, number | null>>>({})
  const [filterHidden, setFilterHidden] = useState(false)
  const [draftListKey, setDraftListKey] = useState(0)

  const refreshStats = useCallback(async () => {
    try {
      const data = await apiFetchAuth<{ counts: Partial<Record<QuoteStatusId, number | null>> }>(
        '/api/newquote-api/stats',
      )
      setCounts(data.counts || {})
    } catch {
      setCounts({})
    }
  }, [])

  const onQuoteCreated = useCallback(() => {
    refreshStats()
    setDraftListKey((k) => k + 1)
  }, [refreshStats])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  const selectStatus = (id: QuoteStatusId) => {
    setActiveStatus(id)
    setFilterHidden(false)
  }

  const tabLabel = (tab: (typeof QUOTE_STATUS_TABS)[number]) => {
    const n = counts[tab.id]
    return n != null && n > 0 ? `${tab.label} (${n})` : tab.label
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Search quotes</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUOTE_STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectStatus(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-brand-yellow bg-brand-yellow/15 text-brand-yellow'
                  : 'border-white/15 bg-black/50 text-gray-300 hover:border-white/30 hover:text-white'
              }`}
              aria-pressed={isActive}
            >
              {tabLabel(tab)}
            </button>
          )
        })}
      </div>

      {!filterHidden ? (
        <Card className="border-white/10 bg-black/40 p-5 md:p-6">
          <QuoteFormBody
            active={activeStatus}
            onHideFilter={() => setFilterHidden(true)}
            onQuoteCreated={onQuoteCreated}
            draftListKey={draftListKey}
          />
        </Card>
      ) : (
        <Card className="border border-dashed border-white/20 bg-black/30 p-10 text-center">
          <p className="text-sm text-gray-400">Search filter is hidden.</p>
          <Button type="button" className="mt-4" variant="outline" onClick={() => setFilterHidden(false)}>
            Show search filter
          </Button>
        </Card>
      )}
    </div>
  )
}
