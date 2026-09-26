/** Navegação compartilhada: barra baixa no celular, coluna à esquerda no desktop. */
import type { ReactNode } from 'react'
import type { Cultura } from '@/types/models'

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

const iconeCalda = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10z" />
  </svg>
)

const iconeAgenda = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="15" rx="1" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)

const iconeInsumos = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 8h16l-1.2 11.2A2 2 0 0 1 16.81 21H7.19a2 2 0 0 1-1.99-1.8L4 8zM8 8V6a4 4 0 0 1 8 0v2" />
  </svg>
)

const iconeDiaria = (
  <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="8" r="3" />
    <circle cx="16" cy="9" r="2.5" />
    <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M13 14.2c1.8.3 3.4 1.6 4.2 3.8" />
  </svg>
)

/** Na manga o ícone de agenda abre o calendário da mangueira, não o caderno vazio. */
export function bottomNavItems(cultura: Cultura | null): NavItem[] {
  const meio: NavItem =
    cultura === 'uva'
      ? { to: '/ciclo', label: 'Ciclo', icon: iconeAgenda }
      : { to: '/safra', label: 'Safra', icon: iconeAgenda }

  return [
    { to: '/', label: 'Início', icon: iconeCasa },
    { to: '/calda', label: 'Calda', icon: iconeCalda },
    meio,
    { to: '/insumos', label: 'Insumos', icon: iconeInsumos },
    { to: '/mao-de-obra', label: 'Diária', icon: iconeDiaria },
  ]
}

export const BOTTOM_NAV_ITEMS = bottomNavItems(null)
export const BOTTOM_NAV_PATHS = BOTTOM_NAV_ITEMS.map((item) => item.to)
