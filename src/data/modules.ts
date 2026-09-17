/** Atalhos da home: uma linha por ferramenta do caderno. */
import type { Cultura } from '@/types/models'

export interface AppModule {
  to: string
  title: string
  description: string
}

export const APP_MODULES: AppModule[] = [
  {
    to: '/produtor',
    title: 'Produtor',
    description: 'Cultura, área e datas da safra',
  },
  {
    to: '/calda',
    title: 'Calda',
    description: 'Tanque, área e receita',
  },
  {
    to: '/insumos',
    title: 'Insumos',
    description: 'Plantas por porte e custo',
  },
  {
    to: '/mao-de-obra',
    title: 'Mão de obra',
    description: 'Diária, gente e serviços',
  },
  {
    to: '/ciclo',
    title: 'Ciclo',
    description: '42 semanas até a colheita',
  },
]

export function culturaLabel(cultura: Cultura | null) {
  if (cultura === 'manga') return 'Manga'
  if (cultura === 'uva') return 'Uva'
  return 'Sem cultura'
}
