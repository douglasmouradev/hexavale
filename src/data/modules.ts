/** Atalhos da home e do menu: caderno geral vs ferramentas da mangueira. */
import type { Cultura } from '@/types/models'

export type ModuleIcon =
  | 'produtor'
  | 'calda'
  | 'custo'
  | 'insumos'
  | 'mao'
  | 'ciclo'
  | 'catalogo'
  | 'regulador'
  | 'calendario'
  | 'safra'

export interface AppModule {
  to: string
  title: string
  description: string
  group: 'caderno' | 'manga'
  icon: ModuleIcon
  culturas?: Cultura[]
}

export const MODULE_GROUPS: { id: AppModule['group']; label: string }[] = [
  { id: 'manga', label: 'Mangueira' },
  { id: 'caderno', label: 'Caderno' },
]

export const APP_MODULES: AppModule[] = [
  {
    to: '/produtor',
    title: 'Produtor',
    description: 'Cultura, área, talhões e datas da safra',
    group: 'caderno',
    icon: 'produtor',
  },
  {
    to: '/calda',
    title: 'Calda',
    description: 'Dose no tanque (ml/L, g/L)',
    group: 'caderno',
    icon: 'calda',
  },
  {
    to: '/custo-calda',
    title: 'Custo da calda orgânica',
    description: 'Kg, R$/litro e valor da operação',
    group: 'caderno',
    icon: 'custo',
  },
  {
    to: '/insumos',
    title: 'Insumos',
    description: 'Plantas por porte e custo',
    group: 'caderno',
    icon: 'insumos',
  },
  {
    to: '/mao-de-obra',
    title: 'Mão de obra',
    description: 'Diárias, serviços e custo por hectare',
    group: 'caderno',
    icon: 'mao',
  },
  {
    to: '/ciclo',
    title: 'Ciclo',
    description: '42 semanas até a colheita',
    group: 'caderno',
    icon: 'ciclo',
  },
  {
    to: '/catalogo',
    title: 'Catálogo',
    description: 'Produtos salvos para reusar',
    group: 'caderno',
    icon: 'catalogo',
  },
  {
    to: '/safra',
    title: 'Calcular safra',
    description: 'Poda, vegetativo, indução e colheita a partir de uma data',
    group: 'manga',
    icon: 'safra',
    culturas: ['manga'],
  },
  {
    to: '/calendario',
    title: 'Planejar tratos',
    description: 'Semanas, 3 atividades, valor/planta e % do ciclo',
    group: 'manga',
    icon: 'calendario',
    culturas: ['manga'],
  },
  {
    to: '/regulador',
    title: 'Regulador de crescimento',
    description: 'Dosagem por porte, volume e custo',
    group: 'manga',
    icon: 'regulador',
    culturas: ['manga'],
  },
]

export function moduleVisivel(module: AppModule, cultura: Cultura | null) {
  if (!module.culturas?.length) return true
  if (cultura === 'uva') return false
  return true
}

export function modulesVisiveis(cultura: Cultura | null) {
  const lista = APP_MODULES.filter((module) => moduleVisivel(module, cultura))
  if (cultura !== 'manga') return lista
  return [
    ...lista.filter((module) => module.group === 'manga'),
    ...lista.filter((module) => module.group !== 'manga'),
  ]
}

export function culturaLabel(cultura: Cultura | null) {
  if (cultura === 'manga') return 'Manga'
  if (cultura === 'uva') return 'Uva'
  return 'Sem cultura'
}
