/** Aviso de caderno: faixa à esquerda, cores da marca (sem red-50). */
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface BannerProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: 'ok' | 'warn' | 'danger'
}

export function Banner({ className, tone = 'ok', ...props }: BannerProps) {
  return (
    <p
      className={cn(
        'border-l-4 px-3 py-2.5 text-sm font-medium',
        tone === 'ok' && 'border-field bg-field/10 text-field',
        tone === 'warn' && 'border-mango bg-mango/10 text-soil',
        tone === 'danger' && 'border-danger bg-danger/10 text-danger',
        className,
      )}
      {...props}
    />
  )
}
