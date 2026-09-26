/** As quatro calculadoras do campo. */
export type ModuleIcon = 'safra' | 'regulador' | 'custo' | 'calendario'

export interface AppModule {
  to: string
  title: string
  description: string
  icon: ModuleIcon
}

export const APP_MODULES: AppModule[] = [
  {
    to: '/safra',
    title: 'Calcular Safra',
    description: 'Poda, vegetativo, indução e colheita a partir de uma data',
    icon: 'safra',
  },
  {
    to: '/regulador',
    title: 'Calcular PBZ',
    description: 'Dosagem por porte, volume e custo do regulador',
    icon: 'regulador',
  },
  {
    to: '/custo-calda',
    title: 'Calcular Calda Orgânica',
    description: 'Kg, R$/litro e valor da operação no ciclo',
    icon: 'custo',
  },
  {
    to: '/calendario',
    title: 'Planejar Tratos Culturais',
    description: 'Semanas, atividades, valor/planta e custo do ciclo',
    icon: 'calendario',
  },
]

export function modulesVisiveis() {
  return APP_MODULES
}

export function culturaLabel(cultura: 'manga' | 'uva' | null) {
  if (cultura === 'manga') return 'Manga'
  if (cultura === 'uva') return 'Uva'
  return 'Sem cultura'
}
