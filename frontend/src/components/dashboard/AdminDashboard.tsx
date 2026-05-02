import { useState } from 'react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { MAIN_NAV, type MainNavId } from './admin/quoteTypes'
import { QuotesWorkspace } from './admin/QuotesWorkspace'

const HEADER_LINKS = ['My diary', 'CRM', 'Notifications', 'Partners'] as const

interface AdminDashboardProps {
  userEmail: string
  onLogout: () => void
}

export const AdminDashboard = ({ userEmail, onLogout }: AdminDashboardProps) => {
  const [mainSection, setMainSection] = useState<MainNavId>('quotes')

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-0">
      <header className="border-b border-white/10 bg-black/50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Logo className="max-w-[200px] shrink-0" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
            {HEADER_LINKS.map((label) => (
              <button
                key={label}
                type="button"
                className="hover:text-brand-yellow"
                disabled
                title="Coming soon"
              >
                {label}
              </button>
            ))}
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <span className="max-w-[200px] truncate text-xs text-gray-500" title={userEmail}>
                {userEmail}
              </span>
              <Button type="button" variant="outline" className="shrink-0 px-4 py-2 text-xs" onClick={onLogout}>
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav
        className="scrollbar-thin overflow-x-auto border-b border-white/10 bg-black/40 px-4 sm:px-6"
        aria-label="Main modules"
      >
        <div className="mx-auto flex max-w-[1600px] min-w-min gap-1 py-2">
          {MAIN_NAV.map((item) => {
            const active = mainSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMainSection(item.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          {mainSection === 'quotes' ? (
            <QuotesWorkspace />
          ) : (
            <Card className="border-white/10 bg-black/40 p-10 text-center">
              <h2 className="text-lg font-semibold text-white">
                {MAIN_NAV.find((n) => n.id === mainSection)?.label ?? mainSection}
              </h2>
              <p className="mt-2 text-sm text-gray-400">This module is not built yet. Use Quotes for the live layout.</p>
            </Card>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t border-white/10 py-4 text-center text-xs text-gray-500">
        Powered by Optimal Group, {new Date().getFullYear()}
      </footer>
    </div>
  )
}
