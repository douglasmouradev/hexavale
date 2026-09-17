import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  full?: boolean
}

export function Button({
  variant = 'primary',
  full = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-14 items-center justify-center rounded-2xl px-5 text-base font-bold transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-field text-white shadow-sm',
        variant === 'secondary' && 'bg-mango text-white shadow-sm',
        variant === 'ghost' && 'bg-transparent text-field',
        variant === 'outline' && 'border border-field/20 bg-paper text-field',
        full && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
