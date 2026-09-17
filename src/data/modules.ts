/** Atalhos da home e do menu: caderno geral vs ferramentas da mangueira. */
import type { Cultura } from '@/types/models'

export interface AppModule {
  to: string
  title: string
  description: string
  group: 'caderno' | 'manga'
  culturas?: Cultura[]
}

export const MODULE_GROUPS: { id: AppModule['group']; label: string }[] = [
  { id: 'caderno', label: 'Caderno' },
  { id: 'manga', label: 'Mangueira' },
]

export const APP_MODULES: AppModule[] = [
  {
    to: '/produtor',
    title: 'Produtor',
    description: 'Cultura, área e datas da safra',
    group: 'caderno',
  },
  {
    to: '/calda',
    title: 'Calda',
    description: 'Tanque, área e receita',
    group: 'caderno',
  },
  {
    to: '/custo-calda',
    title: 'Custo da calda',
    description: 'Kg, R$/litro e ciclo',
    group: 'caderno',
  },
  {
    to: '/insumos',
    title: 'Insumos',
    description: 'Plantas por porte e custo',
    group: 'caderno',
  },
  {
    to: '/mao-de-obra',
    title: 'Mão de obra',
    description: 'Diária, gente e serviços',
    group: 'caderno',
  },
  {
    to: '/ciclo',
    title: 'Ciclo',
    description: '42 semanas até a colheita',
    group: 'caderno',
  },
  {
    to: '/catalogo',
    title: 'Catálogo',
    description: 'Produtos salvos para reusar',
    group: 'caderno',
  },
  {
    to: '/regulador',
    title: 'Regulador',
    description: 'mL por planta e custo',
    group: 'manga',
    culturas: ['manga'],
  },
  {
    to: '/calendario',
    title: 'Calendário',
    description: 'Datas e custos da mangueira',
    group: 'manga',
    culturas: ['manga'],
  },
]

export function moduleVisivel(module: AppModule, cultura: Cultura | null) {
  if (!module.culturas?.length) return true
  if (cultura === 'uva') return false
  return true
}

export function modulesVisiveis(cultura: Cultura | null) {
  return APP_MODULES.filter((module) => moduleVisivel(module, cultura))
}

export function culturaLabel(cultura: Cultura | null) {
  if (cultura === 'manga') return 'Manga'
  if (cultura === 'uva') return 'Uva'
  return 'Sem cultura'
}
