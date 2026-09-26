/** Barra baixa: início e as quatro calculadoras. */
import { NavLink } from 'react-router-dom'
import { bottomNavItems } from '@/components/layout/navItems'
import { cn } from '@/lib/format'

export function BottomNav() {
  const itens = bottomNavItems()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] desk:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {itens.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-2 pt-1 text-xs font-semibold',
                  isActive
                    ? 'border-mango bg-mango/10 text-field'
                    : 'border-transparent text-soil',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
