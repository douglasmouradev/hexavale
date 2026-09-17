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
      <span className="text-[13px] font-semibold tracking-[0.02em] text-soil">
        {label}
      </span>
      <input
        id={inputId}
        className={cn(
          'min-h-14 w-full rounded-leaf border-0 bg-cream px-3.5 text-[17px] font-medium text-ink outline-none placeholder:text-soil/30 focus:bg-paper focus:shadow-[0_0_0_2px_var(--color-field)] lg:min-h-12 lg:text-base',
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-sm text-soil">{hint}</span> : null}
    </label>
  )
}
