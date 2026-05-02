export type QuoteStatusId =
  | 'search'
  | 'new'
  | 'drafts'
  | 'converted'
  | 'actioned'
  | 'callback'
  | 'accepted'
  | 'rejected'
  | 'sales_appointment'

export const QUOTE_STATUS_TABS: { id: QuoteStatusId; label: string }[] = [
  { id: 'search', label: 'Search quotes' },
  { id: 'new', label: 'New quote' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'converted', label: 'Converted' },
  { id: 'actioned', label: 'Actioned' },
  { id: 'callback', label: 'Callback' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'sales_appointment', label: 'Sales Appointment' },
]

export type MainNavId =
  | 'leads'
  | 'quotes'
  | 'jobs'
  | 'planner'
  | 'finance'
  | 'contacts'
  | 'items'
  | 'expenses'
  | 'users'
  | 'reports'
  | 'file_manager'

export const MAIN_NAV: { id: MainNavId; label: string }[] = [
  { id: 'leads', label: 'Leads' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'planner', label: 'Planner' },
  { id: 'finance', label: 'Finance' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'items', label: 'Items' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'users', label: 'Users' },
  { id: 'reports', label: 'Reports' },
  { id: 'file_manager', label: 'File Manager' },
]
