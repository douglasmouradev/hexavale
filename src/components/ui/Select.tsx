/** Select nativo no mesmo recorte dos inputs. */
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, id, className, children, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      <span className="text-sm font-medium text-soil">{label}</span>
      <select
        id={selectId}
        className={cn(
          'min-h-14 w-full rounded-leaf border border-line bg-paper px-3 text-lg font-medium text-ink outline-none focus:border-field',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
