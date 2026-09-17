/** Barra baixa de ferramenta: linha, sem cápsula flutuante. */
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/format'

const ITEMS = [
  {
    to: '/',
    label: 'Início',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    to: '/calda',
    label: 'Calda',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10z" />
      </svg>
    ),
  },
  {
    to: '/ciclo',
    label: 'Ciclo',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="1" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    ),
  },
  {
    to: '/insumos',
    label: 'Insumos',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h16l-1.2 11.2A2 2 0 0 1 16.81 21H7.19a2 2 0 0 1-1.99-1.8L4 8zM8 8V6a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
  {
    to: '/mao-de-obra',
    label: 'Diária',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M13 14.2c1.8.3 3.4 1.6 4.2 3.8" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => (
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
