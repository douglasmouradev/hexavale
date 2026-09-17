/** Campo de formulário com área de toque grande. */
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/format'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
}

export function Input({ label, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-semibold text-soil">{label}</span>
      <input
        id={inputId}
        className={cn(
          'min-h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-lg font-semibold text-ink outline-none placeholder:text-stone-400 focus:border-mango',
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-sm font-medium text-soil">{hint}</span> : null}
    </label>
  )
}
