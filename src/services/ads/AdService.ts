export type AdPlacement = 'login' | 'calculate'

export type AdProviderId = 'mock' | 'adsense' | 'admob'

export interface AdCreative {
  title: string
  subtitle: string
  sponsor: string
  cta: string
}

export interface AdProvider {
  readonly id: AdProviderId
  readonly displayName: string
  load(placement: AdPlacement): Promise<void>
  getCreative(placement: AdPlacement): AdCreative
}

export interface InterstitialPolicy {
  durationSeconds: number
  skipAfterSeconds: number
}

const POLICIES: Record<AdPlacement, InterstitialPolicy> = {
  login: { durationSeconds: 15, skipAfterSeconds: 10 },
  calculate: { durationSeconds: 8, skipAfterSeconds: 5 },
}

class AdService {
  private provider: AdProvider

  constructor(provider: AdProvider) {
    this.provider = provider
  }

  setProvider(provider: AdProvider) {
    this.provider = provider
  }

  getProvider() {
    return this.provider
  }

  getPolicy(placement: AdPlacement): InterstitialPolicy {
    return POLICIES[placement]
  }

  async prepare(placement: AdPlacement) {
    await this.provider.load(placement)
    return {
      policy: this.getPolicy(placement),
      creative: this.provider.getCreative(placement),
      providerName: this.provider.displayName,
    }
  }
}

export { AdService }
