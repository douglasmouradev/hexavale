/** Linha de caderneta: nome à esquerda, valor à direita. */
import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function Row({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <p className={cn('flex justify-between gap-3 border-b border-line py-2.5 text-sm last:border-0', className)}>
      <span className="text-soil">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </p>
  )
}
