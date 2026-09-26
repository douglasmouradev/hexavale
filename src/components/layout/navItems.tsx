/** Navegação: início e as quatro calculadoras. */
import type { ReactNode } from 'react'

export interface NavItem {
  to: string
  label: string
  icon?: ReactNode
}

const iconClass = 'h-5 w-5'

const iconeCasa = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  </svg>
)

const iconeSafra = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="15" rx="1" />
    <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />
  </svg>
)

const iconePbz = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21c-4 0-7-3.2-7-8 0-4 4-9 7-11 3 2 7 7 7 11 0 4.8-3 8-7 8Zm-2-8 2 2 4-5" />
  </svg>
)

const iconeCalda = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10z" />
  </svg>
)

const iconeTratos = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="15" rx="1" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)

export function bottomNavItems(): NavItem[] {
  return [
    { to: '/', label: 'Início', icon: iconeCasa },
    { to: '/safra', label: 'Safra', icon: iconeSafra },
    { to: '/regulador', label: 'PBZ', icon: iconePbz },
    { to: '/custo-calda', label: 'Calda', icon: iconeCalda },
    { to: '/calendario', label: 'Tratos', icon: iconeTratos },
  ]
}

export const BOTTOM_NAV_ITEMS = bottomNavItems()
export const BOTTOM_NAV_PATHS = BOTTOM_NAV_ITEMS.map((item) => item.to)
