/** Cartão de caderno: recorte seco, borda de linha. Verde só no resumo da safra. */
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'plain' | 'field'
}

export function Card({ className, tone = 'plain', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-leaf p-4',
        tone === 'plain' && 'border border-line bg-paper text-ink shadow-paper',
        tone === 'field' && 'border-l-4 border-mango bg-field text-white shadow-none',
        className,
      )}
      {...props}
    />
  )
}
