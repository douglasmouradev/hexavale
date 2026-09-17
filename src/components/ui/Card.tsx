import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'plain' | 'field'
}

export function Card({ className, tone = 'plain', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-5',
        tone === 'plain' && 'bg-paper text-ink shadow-[0_8px_30px_rgba(23,20,17,0.06)]',
        tone === 'field' && 'bg-field text-white shadow-[0_12px_32px_rgba(26,61,43,0.28)]',
        className,
      )}
      {...props}
    />
  )
}
