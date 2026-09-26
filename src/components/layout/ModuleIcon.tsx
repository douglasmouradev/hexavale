/** Ícone verde das ferramentas do campo, como na home. */
import type { ModuleIcon as ModuleIconId } from '@/data/modules'

const box = 'h-5 w-5'

export function ModuleIcon({ name }: { name: ModuleIconId }) {
  const paths: Record<ModuleIconId, string> = {
    produtor:
      'M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm0 2c-3.2 0-6 1.7-6 4v1h12v-1c0-2.3-2.8-4-6-4Z',
    calda: 'M12 3s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10z',
    custo:
      'M4 7h16v12H4zM8 7V5.5A4 4 0 0 1 12 1.5 4 4 0 0 1 16 5.5V7M8 13h8',
    insumos: 'M4 8h16l-1.2 11.2A2 2 0 0 1 16.81 21H7.19a2 2 0 0 1-1.99-1.8L4 8zM8 8V6a4 4 0 0 1 8 0v2',
    mao: 'M9 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm7 1a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 16 9ZM3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M13 14.2c1.8.3 3.4 1.6 4.2 3.8',
    ciclo: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16',
    catalogo: 'M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Zm0 16a2 2 0 0 1 2-2h12',
    regulador:
      'M12 21c-4 0-7-3.2-7-8 0-4 4-9 7-11 3 2 7 7 7 11 0 4.8-3 8-7 8Zm-2-8 2 2 4-5',
    calendario: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16',
    safra: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16M8 14h3M8 17h6',
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-leaf bg-field/10 text-field">
      <svg viewBox="0 0 24 24" className={box} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d={paths[name]} />
      </svg>
    </span>
  )
}
