/** Ícone verde das quatro ferramentas do campo. */
import type { ModuleIcon as ModuleIconId } from '@/data/modules'

const box = 'h-5 w-5'

export function ModuleIcon({ name }: { name: ModuleIconId }) {
  const paths: Record<ModuleIconId, string> = {
    safra: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16M8 14h3M8 17h6',
    regulador:
      'M12 21c-4 0-7-3.2-7-8 0-4 4-9 7-11 3 2 7 7 7 11 0 4.8-3 8-7 8Zm-2-8 2 2 4-5',
    custo: 'M4 7h16v12H4zM8 7V5.5A4 4 0 0 1 12 1.5 4 4 0 0 1 16 5.5V7M8 13h8',
    calendario: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16',
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-leaf bg-field/10 text-field">
      <svg viewBox="0 0 24 24" className={box} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d={paths[name]} />
      </svg>
    </span>
  )
}
