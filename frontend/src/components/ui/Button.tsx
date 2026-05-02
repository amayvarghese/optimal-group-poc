/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-yellow text-brand-black hover:bg-yellow-400 focus-visible:ring-brand-yellow',
        ghost: 'bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/50',
        outline:
          'border border-brand-yellow bg-transparent text-white hover:bg-brand-yellow/10 focus-visible:ring-brand-yellow',
        link: 'text-brand-yellow underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, fullWidth = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fullWidth && 'w-full')}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
