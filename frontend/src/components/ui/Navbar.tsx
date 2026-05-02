import { Link, NavLink } from 'react-router-dom'
import { Button } from './Button'
import { Logo } from './Logo'

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-brand-black/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Go to homepage" className="w-[170px]">
          <Logo />
        </Link>

        <div className="flex items-center gap-1 text-sm font-light uppercase tracking-[0.14em]">
          <NavLink to="/" className="rounded-lg px-3 py-2 text-white hover:bg-white/10">
            About Us
          </NavLink>
          <a href="#contact" className="rounded-lg px-3 py-2 text-white hover:bg-white/10">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/signup" aria-label="Open sign up page">
            <Button variant="outline" className="h-10 px-4 uppercase tracking-[0.14em]">
              Signup
            </Button>
          </Link>
          <Link to="/login" aria-label="Open login page">
            <Button variant="ghost" className="h-10 px-4 uppercase tracking-[0.14em]">
              Login
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
