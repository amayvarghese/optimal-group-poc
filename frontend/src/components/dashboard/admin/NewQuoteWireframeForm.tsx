import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { apiFetchAuth } from '../../../lib/api'

type ClientRow = {
  _id: string
  clientId: string
  displayName: string
  companyName: string
  contactName: string
}

const inputClass =
  'h-11 w-full rounded-xl border border-white/20 bg-black px-3 text-sm text-white placeholder:text-gray-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40'

function DashedSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-dashed border-white/25 bg-black/25 p-4 md:p-6">
      <h3 className="mb-4 border-b border-white/10 pb-2 text-sm font-semibold uppercase tracking-wide text-brand-yellow/90">
        {title}
      </h3>
      {children}
    </section>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {children}
      </select>
    </div>
  )
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} min-h-[88px] resize-y py-2`}
      />
    </div>
  )
}

const emptyLine = () => ({
  code: '',
  product: '',
  description: '',
  accountCode: '',
  qty: 0,
  costPrice: 0,
  costCalc: '',
  pricePounds: 0,
  markupPct: 0,
  vatPct: 0,
  discount: 0,
  amount: 0,
  profit: 0,
})

/** Inserts structured bold headings into the rich-text Description field. */
const EXTRA_DESCRIPTION_MAGIC_HTML = `<p><strong>Access:</strong> </p><p><strong>Quote:</strong> </p><p><strong>Info:</strong> </p><p><strong>Travel:</strong> </p><p><strong>Contact:</strong> </p><p><strong>Quote Screening Answers:</strong> </p>`

type QuoteAttachmentDraft = {
  id: string
  title: string
  fileName: string
  mimeType: string
  fileBase64: string
}

export const NewQuoteWireframeForm = ({ onQuoteCreated }: { onQuoteCreated?: () => void }) => {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [clientId, setClientId] = useState('')
  const [savedRef, setSavedRef] = useState<string | null>(null)

  const [billingContact, setBillingContact] = useState('Default')
  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingCounty, setBillingCounty] = useState('')
  const [billingPostcode, setBillingPostcode] = useState('')
  const [billingTelephone, setBillingTelephone] = useState('')
  const [billingMobile, setBillingMobile] = useState('')
  const [billingWhatsApp, setBillingWhatsApp] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [billingCountry, setBillingCountry] = useState('United Kingdom')
  const [billingCompany, setBillingCompany] = useState('')

  const [siteKey, setSiteKey] = useState('None')
  const [siteName, setSiteName] = useState('')
  const [siteCompany, setSiteCompany] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [siteCity, setSiteCity] = useState('')
  const [siteCounty, setSiteCounty] = useState('')
  const [sitePostcode, setSitePostcode] = useState('')
  const [siteTelephone, setSiteTelephone] = useState('')
  const [siteMobile, setSiteMobile] = useState('')
  const [siteCountry, setSiteCountry] = useState('United Kingdom')

  const [accountManager, setAccountManager] = useState('')
  const [commissionPct, setCommissionPct] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [toChase, setToChase] = useState('')
  const [uploadToFixflo, setUploadToFixflo] = useState('')
  const [campaign, setCampaign] = useState('')
  const [dateTagChanged, setDateTagChanged] = useState('')
  const [latestUpdate, setLatestUpdate] = useState('')
  const [trade, setTrade] = useState('')
  const [category, setCategory] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [quoteChange, setQuoteChange] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [tenantsDetails, setTenantsDetails] = useState('')
  const [typeOfQuote, setTypeOfQuote] = useState('to_be_determined')

  const [lineItems, setLineItems] = useState([emptyLine()])
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [catalogue, setCatalogue] = useState('')
  const [markupBasedOn, setMarkupBasedOn] = useState('')
  const [template, setTemplate] = useState('Custom Quote')

  const [loadingClients, setLoadingClients] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [addClientOpen, setAddClientOpen] = useState(false)
  const [acCompanyName, setAcCompanyName] = useState('')
  const [acContactName, setAcContactName] = useState('')
  const [acEmail, setAcEmail] = useState('')
  const [acAddress, setAcAddress] = useState('')
  const [acCity, setAcCity] = useState('')
  const [acCounty, setAcCounty] = useState('')
  const [acPostcode, setAcPostcode] = useState('')
  const [acCountry, setAcCountry] = useState('United Kingdom')
  const [acTelephone, setAcTelephone] = useState('')
  const [acMobile, setAcMobile] = useState('')
  const [acWhatsApp, setAcWhatsApp] = useState('')
  const [acSaving, setAcSaving] = useState(false)
  const [acError, setAcError] = useState('')

  const extraDescRef = useRef<HTMLDivElement>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [quoteAttachments, setQuoteAttachments] = useState<QuoteAttachmentDraft[]>([])

  const loadClients = useCallback(async () => {
    setLoadingClients(true)
    setError('')
    try {
      const data = await apiFetchAuth<{ clients: ClientRow[] }>('/api/newquote-api/clients')
      setClients(data.clients || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load clients.')
    } finally {
      setLoadingClients(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  useEffect(() => {
    if (!addClientOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !acSaving) setAddClientOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addClientOpen, acSaving])

  const resetAddClientForm = () => {
    setAcCompanyName('')
    setAcContactName('')
    setAcEmail('')
    setAcAddress('')
    setAcCity('')
    setAcCounty('')
    setAcPostcode('')
    setAcCountry('United Kingdom')
    setAcTelephone('')
    setAcMobile('')
    setAcWhatsApp('')
    setAcError('')
  }

  const openAddClient = () => {
    resetAddClientForm()
    setAddClientOpen(true)
  }

  const applyExtraDescriptionMagic = () => {
    const el = extraDescRef.current
    if (!el) return
    const wrap = document.createElement('div')
    wrap.innerHTML = EXTRA_DESCRIPTION_MAGIC_HTML
    while (wrap.firstChild) el.appendChild(wrap.firstChild)
    el.focus()
  }

  const addAttachmentRow = () => {
    setQuoteAttachments((rows) => [
      ...rows,
      { id: crypto.randomUUID(), title: '', fileName: '', mimeType: '', fileBase64: '' },
    ])
  }

  const removeAttachmentRow = (id: string) => {
    setQuoteAttachments((rows) => rows.filter((r) => r.id !== id))
  }

  const updateAttachmentTitle = (id: string, title: string) => {
    setQuoteAttachments((rows) => rows.map((r) => (r.id === id ? { ...r, title } : r)))
  }

  const onAttachmentFile = (id: string, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') return
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      setQuoteAttachments((rows) =>
        rows.map((r) =>
          r.id === id
            ? { ...r, fileName: file.name, mimeType: file.type || 'application/octet-stream', fileBase64: base64 }
            : r,
        ),
      )
    }
    reader.readAsDataURL(file)
  }

  const saveNewClient = async () => {
    setAcError('')
    const company = acCompanyName.trim()
    if (!company) {
      setAcError('Company name is required.')
      return
    }
    setAcSaving(true)
    try {
      const data = await apiFetchAuth<{ client: { _id: string } }>('/api/newquote-api/clients', {
        method: 'POST',
        body: JSON.stringify({
          companyName: company,
          contactName: acContactName.trim(),
          email: acEmail.trim(),
          address: acAddress.trim(),
          city: acCity.trim(),
          county: acCounty.trim(),
          postcode: acPostcode.trim(),
          country: acCountry.trim() || 'United Kingdom',
          telephone: acTelephone.trim(),
          mobile: acMobile.trim(),
          whatsApp: acWhatsApp.trim(),
        }),
      })
      await loadClients()
      if (data.client?._id) {
        setClientId(data.client._id)
      }
      setAddClientOpen(false)
      resetAddClientForm()
    } catch (e) {
      setAcError(e instanceof Error ? e.message : 'Could not save customer.')
    } finally {
      setAcSaving(false)
    }
  }

  const updateLine = (index: number, field: string, value: string | number) => {
    setLineItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
  }

  const insertRow = () => setLineItems((rows) => [...rows, emptyLine()])

  const onSubmit = async () => {
    setError('')
    setSuccess('')
    if (!clientId) {
      setError('Select a customer from the list.')
      return
    }
    setSubmitting(true)
    try {
      const customFields = {
        accountManager,
        commissionPct,
        landlordName,
        toChase,
        uploadToFixflo,
        campaign,
        dateTagChanged,
        latestUpdate,
        trade,
        category,
        estimatedValue,
        quoteChange,
        tenantsDetails,
      }
      const data = await apiFetchAuth<{ quote: { quoteRef: string } }>('/api/newquote-api', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId,
          typeOfQuote,
          billing: {
            contact: billingContact,
            name: billingName,
            company: billingCompany,
            address: billingAddress,
            city: billingCity,
            county: billingCounty,
            postcode: billingPostcode,
            telephone: billingTelephone,
            mobile: billingMobile,
            whatsApp: billingWhatsApp,
            email: billingEmail,
            country: billingCountry,
          },
          site: {
            siteKey,
            name: siteName,
            company: siteCompany,
            address: siteAddress,
            city: siteCity,
            county: siteCounty,
            postcode: sitePostcode,
            telephone: siteTelephone,
            mobile: siteMobile,
            country: siteCountry,
          },
          customFields,
          shortDescription,
          lineItems,
          extraDescription: extraDescRef.current?.innerHTML ?? '',
          customerNotes,
          attachments: quoteAttachments
            .filter((a) => a.fileBase64.length > 0)
            .map(({ title, fileName, mimeType, fileBase64 }) => ({ title, fileName, mimeType, fileBase64 })),
        }),
      })
      setSavedRef(data.quote?.quoteRef ?? null)
      setSuccess(`Quote saved as ${data.quote?.quoteRef ?? 'draft'}.`)
      onQuoteCreated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-brand-yellow/40 bg-brand-yellow/10 px-4 py-2 text-sm text-brand-yellow">
          {success}
        </p>
      ) : null}

      <DashedSection title="Customer details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quote ref</label>
            <p className="rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-gray-400">
              {savedRef ? savedRef : 'Generated when you save (e.g. Q00042)'}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="nq-customer" className="text-sm font-medium text-white">
              Customer <span className="text-brand-yellow">*</span>
            </label>
            <div className="flex gap-2">
              <select
                id="nq-customer"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loadingClients}
                className={`${inputClass} flex-1`}
              >
                <option value="">{loadingClients ? 'Loading…' : 'Select customer'}</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.displayName || c.companyName}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 px-3 text-lg font-semibold"
                onClick={openAddClient}
                title="Add a new customer"
                aria-label="Add new customer"
              >
                +
              </Button>
              <Button type="button" variant="outline" className="shrink-0 px-3" onClick={loadClients} title="Refresh">
                ↻
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <p className="rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-gray-300">Draft</p>
          </div>
          {!loadingClients && clients.length === 0 ? (
            <p className="col-span-full text-sm text-gray-400">
              You do not have any saved customers yet, so the list is empty. Click the{' '}
              <span className="font-semibold text-brand-yellow">+</span> button next to the dropdown to add a company;
              it is stored for reuse on every quote.
            </p>
          ) : null}
        </div>
      </DashedSection>

      <DashedSection title="Billing details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SelectField id="bill-contact" label="Contact" value={billingContact} onChange={setBillingContact}>
            <option value="Default">Default</option>
            <option value="Alt">Alternate</option>
          </SelectField>
          <Input id="bill-name" label="Name *" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
          <Input
            id="bill-company"
            label="Company"
            value={billingCompany}
            onChange={(e) => setBillingCompany(e.target.value)}
          />
          <TextAreaField
            id="bill-address"
            label="Address *"
            value={billingAddress}
            onChange={setBillingAddress}
            placeholder="Street, unit…"
          />
          <Input id="bill-city" label="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
          <Input
            id="bill-county"
            label="County"
            value={billingCounty}
            onChange={(e) => setBillingCounty(e.target.value)}
          />
          <Input
            id="bill-post"
            label="Postcode"
            value={billingPostcode}
            onChange={(e) => setBillingPostcode(e.target.value)}
          />
          <Input
            id="bill-tel"
            label="Telephone"
            value={billingTelephone}
            onChange={(e) => setBillingTelephone(e.target.value)}
            placeholder="+44 …"
          />
          <Input
            id="bill-mob"
            label="Mobile"
            value={billingMobile}
            onChange={(e) => setBillingMobile(e.target.value)}
            placeholder="+44 …"
          />
          <Input
            id="bill-wa"
            label="WhatsApp"
            value={billingWhatsApp}
            onChange={(e) => setBillingWhatsApp(e.target.value)}
            placeholder="+44 …"
          />
          <Input
            id="bill-email"
            label="Email"
            type="email"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
          />
          <SelectField id="bill-country" label="Country" value={billingCountry} onChange={setBillingCountry}>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Ireland">Ireland</option>
            <option value="Other">Other</option>
          </SelectField>
        </div>
      </DashedSection>

      <DashedSection title="Customer site details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SelectField id="site-key" label="Site" value={siteKey} onChange={setSiteKey}>
            <option value="None">None</option>
            <option value="Primary">Primary site</option>
          </SelectField>
          <Input id="site-name" label="Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Contact name" />
          <Input
            id="site-co"
            label="Company"
            value={siteCompany}
            onChange={(e) => setSiteCompany(e.target.value)}
            placeholder="Company name"
          />
          <TextAreaField id="site-addr" label="Address" value={siteAddress} onChange={setSiteAddress} />
          <Input id="site-city" label="City" value={siteCity} onChange={(e) => setSiteCity(e.target.value)} />
          <Input id="site-county" label="County" value={siteCounty} onChange={(e) => setSiteCounty(e.target.value)} />
          <Input
            id="site-post"
            label="Postcode"
            value={sitePostcode}
            onChange={(e) => setSitePostcode(e.target.value)}
          />
          <Input
            id="site-tel"
            label="Telephone"
            value={siteTelephone}
            onChange={(e) => setSiteTelephone(e.target.value)}
          />
          <Input id="site-mob" label="Mobile" value={siteMobile} onChange={(e) => setSiteMobile(e.target.value)} />
          <SelectField id="site-country" label="Country" value={siteCountry} onChange={setSiteCountry}>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Ireland">Ireland</option>
            <option value="Other">Other</option>
          </SelectField>
        </div>
      </DashedSection>

      <DashedSection title="Custom fields">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SelectField id="cf-am" label="Account manager" value={accountManager} onChange={setAccountManager}>
            <option value="">—</option>
            <option value="a1">Team A</option>
            <option value="a2">Team B</option>
          </SelectField>
          <SelectField id="cf-comm" label="Commission %" value={commissionPct} onChange={setCommissionPct}>
            <option value="">—</option>
            <option value="5">5%</option>
            <option value="10">10%</option>
          </SelectField>
          <Input
            id="cf-landlord"
            label="Landlord's name or Co. *"
            value={landlordName}
            onChange={(e) => setLandlordName(e.target.value)}
          />
          <SelectField id="cf-chase" label="To chase *" value={toChase} onChange={setToChase}>
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectField>
          <SelectField id="cf-fixflo" label="Upload to Fixflo" value={uploadToFixflo} onChange={setUploadToFixflo}>
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectField>
          <SelectField id="cf-camp" label="Campaign" value={campaign} onChange={setCampaign}>
            <option value="">—</option>
            <option value="web">Web</option>
            <option value="ref">Referral</option>
          </SelectField>
          <Input
            id="cf-dtc"
            label="Date tag changed"
            type="date"
            value={dateTagChanged}
            onChange={(e) => setDateTagChanged(e.target.value)}
          />
          <TextAreaField
            id="cf-update"
            label="Latest update"
            value={latestUpdate}
            onChange={setLatestUpdate}
            rows={2}
          />
          <SelectField id="cf-trade" label="Trade" value={trade} onChange={setTrade}>
            <option value="">—</option>
            <option value="plumb">Plumbing</option>
            <option value="elec">Electrical</option>
          </SelectField>
          <SelectField id="cf-cat" label="Category" value={category} onChange={setCategory}>
            <option value="">—</option>
            <option value="maint">Maintenance</option>
            <option value="void">Void</option>
          </SelectField>
          <Input
            id="cf-ev"
            label="Estimated value"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
            placeholder="e.g. 3000"
          />
          <SelectField id="cf-qc" label="Quote change" value={quoteChange} onChange={setQuoteChange}>
            <option value="">—</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
          </SelectField>
          <Input
            id="cf-short"
            label="Short quote description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
          <TextAreaField
            id="cf-tenants"
            label="Tenants details *"
            value={tenantsDetails}
            onChange={setTenantsDetails}
          />
          <SelectField id="cf-type" label="Type of quote *" value={typeOfQuote} onChange={setTypeOfQuote}>
            <option value="to_be_determined">To be determined</option>
            <option value="desktop">Desktop</option>
            <option value="attend">Attend</option>
            <option value="supply_chain">Supply Chain</option>
          </SelectField>
        </div>
      </DashedSection>

      <DashedSection title="Item details">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Input
            id="item-search"
            label="Select product"
            className="max-w-xs"
            placeholder="Search catalogue…"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <SelectField id="item-cat" label="Catalogue" value={catalogue} onChange={setCatalogue}>
            <option value="">—</option>
            <option value="std">Standard catalogue</option>
          </SelectField>
          <SelectField id="item-markup" label="Markup based on" value={markupBasedOn} onChange={setMarkupBasedOn}>
            <option value="">—</option>
            <option value="cost">Cost</option>
            <option value="list">List price</option>
          </SelectField>
          <SelectField id="item-tpl" label="Template" value={template} onChange={setTemplate}>
            <option value="Custom Quote">Custom Quote</option>
            <option value="Blank">Blank</option>
          </SelectField>
        </div>
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showProductDetails}
            onChange={(e) => setShowProductDetails(e.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-black"
          />
          Show product details
        </label>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-white/10 bg-black/60 text-[10px] uppercase tracking-wider text-gray-400">
                {[
                  'Code',
                  'Product',
                  'Description',
                  'Account code',
                  'Qty',
                  'Cost price',
                  'Cost calc',
                  'Price (£)',
                  'Markup %',
                  'VAT %',
                  'Discount',
                  'Amount',
                  'Profit',
                ].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-1">
                    <input
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.code}
                      onChange={(e) => updateLine(idx, 'code', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full min-w-[80px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.product}
                      onChange={(e) => updateLine(idx, 'product', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full min-w-[100px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.description}
                      onChange={(e) => updateLine(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full min-w-[64px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.accountCode}
                      onChange={(e) => updateLine(idx, 'accountCode', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[48px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.qty || ''}
                      onChange={(e) => updateLine(idx, 'qty', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.costPrice || ''}
                      onChange={(e) => updateLine(idx, 'costPrice', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.costCalc}
                      onChange={(e) => updateLine(idx, 'costCalc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.pricePounds || ''}
                      onChange={(e) => updateLine(idx, 'pricePounds', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[48px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.markupPct || ''}
                      onChange={(e) => updateLine(idx, 'markupPct', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[48px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.vatPct || ''}
                      onChange={(e) => updateLine(idx, 'vatPct', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[48px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.discount || ''}
                      onChange={(e) => updateLine(idx, 'discount', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.amount || ''}
                      onChange={(e) => updateLine(idx, 'amount', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      className="w-full min-w-[56px] rounded border border-white/15 bg-black px-1 py-1 text-xs text-white"
                      value={row.profit || ''}
                      onChange={(e) => updateLine(idx, 'profit', Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={insertRow}>
            Insert row
          </Button>
        </div>
      </DashedSection>

      <DashedSection title="Extra information">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-white">Description</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyExtraDescriptionMagic}
                title="Insert structured bold headings"
              >
                ✨ Magic tool
              </Button>
            </div>
            <div
              ref={extraDescRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              data-placeholder="Type here or use Magic tool for headings…"
              className={`${inputClass} min-h-[220px] max-w-none whitespace-pre-wrap py-2 [&:empty]:before:text-gray-500 [&:empty]:before:content-[attr(data-placeholder)]`}
            />
            <p className="text-xs text-gray-500">
              Magic tool adds: Access, Quote, Info, Travel, Contact, and Quote Screening Answers as bold headings.
            </p>
          </div>
          <TextAreaField
            id="extra-customer-notes"
            label="Customer notes"
            value={customerNotes}
            onChange={setCustomerNotes}
            rows={8}
            placeholder="Notes for this quote…"
          />
        </div>
      </DashedSection>

      <DashedSection title="Attachments">
        <p className="mb-4 text-sm text-gray-400">
          Each row needs a title and a file. Attachments are saved on the quote in MongoDB (very large files can hit the
          database document size limit).
        </p>
        <div className="space-y-4">
          {quoteAttachments.map((att) => (
            <div
              key={att.id}
              className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-black/40 p-4 md:items-end"
            >
              <div className="min-w-[200px] flex-1">
                <Input
                  id={`att-title-${att.id}`}
                  label="Title"
                  value={att.title}
                  onChange={(e) => updateAttachmentTitle(att.id, e.target.value)}
                  placeholder="e.g. Scope PDF"
                />
              </div>
              <div className="min-w-[220px] flex-1 space-y-2">
                <label className="text-sm font-medium text-white" htmlFor={`att-file-${att.id}`}>
                  Document
                </label>
                <input
                  id={`att-file-${att.id}`}
                  type="file"
                  className="block w-full text-sm text-gray-300 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-yellow/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-yellow/30"
                  onChange={(e) => onAttachmentFile(att.id, e.target.files?.[0] ?? null)}
                />
                {att.fileName ? (
                  <p className="text-xs text-brand-yellow/80">Selected: {att.fileName}</p>
                ) : null}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeAttachmentRow(att.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addAttachmentRow}>
            Add attachment
          </Button>
        </div>
      </DashedSection>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Clear form
        </Button>
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save quote'}
        </Button>
      </div>

      {addClientOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-client-title"
          onClick={() => !acSaving && setAddClientOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-client-title" className="text-lg font-semibold text-white">
              Add customer
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Saves to your customer list for this and future quotes.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="ac-company"
                  label="Company name *"
                  value={acCompanyName}
                  onChange={(e) => setAcCompanyName(e.target.value)}
                  placeholder="e.g. Expert Letts Ltd"
                />
              </div>
              <Input
                id="ac-contact"
                label="Contact name"
                value={acContactName}
                onChange={(e) => setAcContactName(e.target.value)}
              />
              <Input
                id="ac-email"
                label="Email"
                type="email"
                value={acEmail}
                onChange={(e) => setAcEmail(e.target.value)}
              />
              <TextAreaField
                id="ac-addr"
                label="Address"
                value={acAddress}
                onChange={setAcAddress}
                rows={2}
              />
              <Input id="ac-city" label="City" value={acCity} onChange={(e) => setAcCity(e.target.value)} />
              <Input id="ac-county" label="County" value={acCounty} onChange={(e) => setAcCounty(e.target.value)} />
              <Input
                id="ac-post"
                label="Postcode"
                value={acPostcode}
                onChange={(e) => setAcPostcode(e.target.value)}
              />
              <SelectField id="ac-country" label="Country" value={acCountry} onChange={setAcCountry}>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Ireland">Ireland</option>
                <option value="Other">Other</option>
              </SelectField>
              <Input
                id="ac-tel"
                label="Telephone"
                value={acTelephone}
                onChange={(e) => setAcTelephone(e.target.value)}
              />
              <Input id="ac-mob" label="Mobile" value={acMobile} onChange={(e) => setAcMobile(e.target.value)} />
              <Input
                id="ac-wa"
                label="WhatsApp"
                value={acWhatsApp}
                onChange={(e) => setAcWhatsApp(e.target.value)}
              />
            </div>
            {acError ? (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {acError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={acSaving}
                onClick={() => {
                  setAddClientOpen(false)
                  resetAddClientForm()
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={saveNewClient} disabled={acSaving}>
                {acSaving ? 'Saving…' : 'Save customer'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
