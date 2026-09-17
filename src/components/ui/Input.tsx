/** Campo com área de toque grande; rótulo médio, não caixa alta. */
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/format'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
}

export function Input({ label, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-soil">{label}</span>
      <input
        id={inputId}
        className={cn(
          'min-h-14 w-full rounded-leaf border border-line bg-paper px-3 text-lg font-medium text-ink outline-none placeholder:text-soil/40 focus:border-field',
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-sm text-soil">{hint}</span> : null}
    </label>
  )
}
