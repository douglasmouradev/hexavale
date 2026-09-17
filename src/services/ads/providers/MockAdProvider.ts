import type { AdCreative, AdPlacement, AdProvider } from '@/services/ads/AdService'

const CREATIVES: Record<AdPlacement, AdCreative> = {
  login: {
    title: 'Insumos com condições especiais',
    subtitle: 'Planeje a safra com parceiros da Hexavale.',
    sponsor: 'Espaço publicitário',
    cta: 'Saiba mais',
  },
  calculate: {
    title: 'Tecnologia no campo',
    subtitle: 'Calcule agora e acompanhe o custo de cada hectare.',
    sponsor: 'Espaço publicitário',
    cta: 'Continuar',
  },
}

export const mockAdProvider: AdProvider = {
  id: 'mock',
  displayName: 'Mock / Placeholder',
  async load() {
    await new Promise((resolve) => setTimeout(resolve, 180))
  },
  getCreative(placement) {
    return CREATIVES[placement]
  },
}
