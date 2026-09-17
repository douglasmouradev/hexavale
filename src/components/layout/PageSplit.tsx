/** No celular empilha; no desktop o resultado fica ao lado, preso no topo. */
import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function PageSplit({
  children,
  aside,
}: {
  children: ReactNode
  aside?: ReactNode
}) {
  const temAside = Boolean(aside)

  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        temAside &&
          'lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]',
      )}
    >
      <div className="space-y-5">{children}</div>
      {temAside ? (
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">{aside}</div>
      ) : null}
    </div>
  )
}
