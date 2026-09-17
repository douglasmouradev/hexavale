/** No celular o botão principal fica acima da barra baixa, ao alcance do polegar. */
import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function scrollAoResultado(el: HTMLElement | null) {
  window.setTimeout(() => {
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)
}

export function StickyAction({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'sticky z-10 -mx-4 mt-2 border-t border-line bg-cream/95 px-4 py-3 desk:static desk:mx-0 desk:mt-0 desk:border-0 desk:bg-transparent desk:px-0 desk:py-0',
        className,
      )}
      style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  )
}
