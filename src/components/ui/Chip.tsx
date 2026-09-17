/** Cultura da safra: mango / uva. Único lugar com pílula. */
import { cn } from '@/lib/format'
import { culturaLabel } from '@/data/modules'
import type { Cultura } from '@/types/models'

export function ChipCultura({ cultura }: { cultura: Cultura | null }) {
  const uva = cultura === 'uva'
  const vazia = !cultura

  return (
    <span
      className={cn(
        'rounded-chip px-2.5 py-0.5 text-xs font-semibold',
        vazia && 'bg-cream text-soil',
        !vazia && uva && 'bg-grape text-white',
        !vazia && !uva && 'bg-mango text-white',
      )}
    >
      {culturaLabel(cultura)}
    </span>
  )
}
