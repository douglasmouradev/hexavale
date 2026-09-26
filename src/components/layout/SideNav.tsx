/** Menu lateral do desktop: as quatro calculadoras. */
import { NavLink } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { modulesVisiveis } from '@/data/modules'
import { cn } from '@/lib/format'

const EXTRA = [{ to: '/meus-dados', title: 'Meus dados' }]

export function SideNav() {
  const visiveis = modulesVisiveis()

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-white/10 bg-field text-white desk:flex xl:w-64">
      <span className="absolute inset-y-0 left-0 w-1 bg-mango" aria-hidden />
      <div className="px-5 pt-6 pb-5">
        <Wordmark height={28} className="brightness-0 invert" />
        <p className="mt-3 text-[13px] leading-5 text-white/55">Calculadoras da mangueira</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
          Início
        </NavLink>
        <p className="mt-4 mb-1 px-3 text-[11px] font-semibold tracking-[0.14em] text-white/40">
          FERRAMENTAS
        </p>
        {visiveis.map((module) => (
          <NavLink key={module.to} to={module.to} className={({ isActive }) => itemClass(isActive)}>
            {module.title}
          </NavLink>
        ))}
        <p className="mt-4 mb-1 px-3 text-[11px] font-semibold tracking-[0.14em] text-white/40">
          DADOS
        </p>
        {EXTRA.map((module) => (
          <NavLink key={module.to} to={module.to} className={({ isActive }) => itemClass(isActive)}>
            {module.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function itemClass(isActive: boolean) {
  return cn(
    'mb-0.5 block rounded-leaf px-3 py-2 text-sm leading-snug',
    isActive
      ? 'bg-white/12 font-medium text-white shadow-[inset_3px_0_0_var(--color-mango)]'
      : 'text-white/80 hover:bg-white/10 hover:text-white',
  )
}
