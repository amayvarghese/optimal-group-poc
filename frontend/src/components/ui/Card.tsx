import type { PropsWithChildren } from 'react'

interface CardProps extends PropsWithChildren {
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <section className={`rounded-2xl border border-white/15 bg-[#121212] p-6 shadow-soft ${className}`}>
      {children}
    </section>
  )
}
