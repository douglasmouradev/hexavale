/** Botão de campo: recorte leaf, toque 56px. Mango só em ação secundária. */
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
        'inline-flex min-h-14 items-center justify-center rounded-leaf px-5 font-sans text-[17px] font-semibold tracking-[0.01em] transition enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 lg:min-h-12 lg:text-base',
        variant === 'primary' && 'bg-field text-cream shadow-lift',
        variant === 'secondary' && 'bg-mango text-white',
        variant === 'ghost' && 'bg-transparent text-field',
        variant === 'outline' && 'border border-line bg-paper text-field',
        full && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
