/** Barra baixa de ferramenta: só no celular e no tablet. */
import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from '@/components/layout/navItems'
import { cn } from '@/lib/format'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] desk:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 border-t-2 text-[11px] font-medium',
                  isActive
                    ? 'border-mango text-field'
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
