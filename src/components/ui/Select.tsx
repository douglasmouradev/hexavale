/** Select nativo no mesmo recorte dos inputs. */
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, id, className, children, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="block min-w-0 space-y-1.5" htmlFor={selectId}>
      <span className="break-words text-[13px] font-semibold tracking-[0.02em] text-soil">
        {label}
      </span>
      <select
        id={selectId}
        className={cn(
          'min-h-14 w-full min-w-0 max-w-full rounded-leaf border-0 bg-cream px-3.5 text-[17px] font-medium text-ink outline-none focus:bg-paper focus:shadow-[0_0_0_2px_var(--color-field)] lg:min-h-12 lg:text-base',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
