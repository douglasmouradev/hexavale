import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, id, className, children, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="block space-y-2" htmlFor={selectId}>
      <span className="text-sm font-semibold text-soil">{label}</span>
      <select
        id={selectId}
        className={cn(
          'min-h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-lg font-semibold text-ink outline-none focus:border-mango',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
