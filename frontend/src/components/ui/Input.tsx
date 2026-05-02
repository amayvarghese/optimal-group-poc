import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export const Input = ({ label, id, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        className={`h-11 w-full rounded-xl border border-white/20 bg-black px-3 text-sm text-white placeholder:text-gray-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 ${className}`}
        {...props}
      />
    </div>
  )
}
