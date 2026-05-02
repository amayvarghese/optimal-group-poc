'use client'

import { ArrowUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  })
}

const navigation = [
  {
    title: 'Company',
    items: [
      { name: 'About', href: '/' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy', href: '#' },
    ],
  },
  {
    title: 'Services',
    items: [
      { name: 'Maintenance', href: '#' },
      { name: 'Construction', href: '#' },
      { name: 'Fit-Out', href: '#' },
    ],
  },
  {
    title: 'Products',
    items: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Login', href: '/login' },
      { name: 'Signup', href: '/signup' },
    ],
  },
  {
    title: 'Support',
    items: [
      { name: 'Careers', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Help Centre', href: '#' },
    ],
  },
]

const iconLinkClass =
  'rounded-xl border border-dotted border-brand-yellow/40 p-2.5 transition-transform hover:-translate-y-1'

export function SiteFooter() {
  return (
    <footer id="contact" className="mx-auto w-full border-b border-t border-white/15 bg-black px-2 pt-12 text-white">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex">
        <Link to="/" className="p-2">
          <Logo className="max-w-[180px]" />
        </Link>
        <p className="bg-transparent text-center text-xs leading-5 text-gray-300 md:text-left">
          Welcome to Optimal Maintenance, where property operations meet execution excellence. We
          streamline maintenance, fit-out works, and furnishing workflows with transparency and speed.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted border-white/20" />
        <div className="py-10">
          <div className="grid grid-cols-2 gap-6 leading-6 md:flex md:justify-between">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                  {section.title}
                </h3>
                <ul role="list" className="flex flex-col space-y-2">
                  {section.items.map((item) => (
                    <li key={item.name} className="flow-root">
                      <a
                        href={item.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white md:text-xs"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-b border-dotted border-white/20" />
      </div>

      <div className="flex flex-wrap justify-center gap-y-6 px-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a aria-label="Mail" href="mailto:info@theoptimalgroup.co.uk" className={iconLinkClass}>
            <Mail className="h-5 w-5 text-brand-yellow" />
          </a>
          <a aria-label="Instagram" href="#" className={iconLinkClass}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-yellow" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a aria-label="Facebook" href="#" className={iconLinkClass}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-yellow" fill="currentColor">
              <path d="M13.5 22v-8h2.8l.5-3h-3.3V9.2c0-.9.4-1.7 1.9-1.7h1.6V4.7s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.8V11H7v3h2.7v8h3.8z" />
            </svg>
          </a>
          <a aria-label="LinkedIn" href="#" className={iconLinkClass}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-yellow" fill="currentColor">
              <path d="M6.9 8.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zM5 10h3.8v9H5zM11 10h3.6v1.3h.1c.5-1 1.7-1.6 3.5-1.6 3.7 0 4.3 2.3 4.3 5.4v3.9h-3.8v-3.5c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7v3.6H11z" />
            </svg>
          </a>
          <a aria-label="YouTube" href="#" className={iconLinkClass}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-yellow" fill="currentColor">
              <path d="M23 12s0-3-0.4-4.4a3 3 0 0 0-2.1-2.1C19.1 5 12 5 12 5s-7.1 0-8.5.5A3 3 0 0 0 1.4 7.6C1 9 1 12 1 12s0 3 0.4 4.4a3 3 0 0 0 2.1 2.1C4.9 19 12 19 12 19s7.1 0 8.5-.5a3 3 0 0 0 2.1-2.1C23 15 23 12 23 12zM10 15.5v-7l6 3.5-6 3.5z" />
            </svg>
          </a>
        </div>

        <div className="mb-2 flex w-full items-center justify-center">
          <button
            type="button"
            onClick={handleScrollTop}
            aria-label="Back to top"
            className="rounded-full border border-dotted border-brand-yellow/40 p-3"
          >
            <ArrowUp className="h-4 w-4 text-brand-yellow" />
          </button>
        </div>
      </div>

      <div className="mx-auto mb-10 mt-10 flex max-w-7xl flex-col justify-between text-center text-xs text-gray-400">
        <div className="flex flex-row items-center justify-center gap-1">
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
          <span>Made for</span>
          <span className="mx-1 text-brand-yellow">Optimal Group</span>
        </div>
      </div>
    </footer>
  )
}
