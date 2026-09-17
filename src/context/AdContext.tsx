/**
 * Anúncio em tela cheia. Não trava o cálculo: se não houver vídeo ou
 * se o último anúncio foi há menos de 15 min, a Promise resolve na hora.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AdInterstitial } from '@/components/ads/AdInterstitial'
import {
  adEmCooldown,
  marcarAdExibido,
  type AdAtual,
  type AdPlacement,
} from '@/lib/ads'
import { fetchCurrentAd } from '@/lib/adminApi'

interface AdContextValue {
  showInterstitial: (placement: AdPlacement) => Promise<void>
}

const AdContext = createContext<AdContextValue | null>(null)

interface InterstitialState {
  open: boolean
  placement: AdPlacement
  ad: AdAtual | null
  resolve: (() => void) | null
}

const INITIAL: InterstitialState = {
  open: false,
  placement: 'login',
  ad: null,
  resolve: null,
}

export function AdGateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterstitialState>(INITIAL)

  const showInterstitial = useCallback(async (placement: AdPlacement) => {
    // No pomar o cálculo não para a cada toque; no login o anúncio entra sempre.
    if (placement !== 'login' && adEmCooldown()) return
    const ad = await fetchCurrentAd()
    if (!ad?.url) return

    await new Promise<void>((resolve) => {
      setState({
        open: true,
        placement,
        ad,
        resolve,
      })
    })
  }, [])

  const handleComplete = useCallback(() => {
    marcarAdExibido()
    setState((current) => {
      current.resolve?.()
      return INITIAL
    })
  }, [])

  const value = useMemo(() => ({ showInterstitial }), [showInterstitial])

  return (
    <AdContext.Provider value={value}>
      {children}
      {state.open && state.ad ? (
        <AdInterstitial
          placement={state.placement}
          titulo={state.ad.titulo}
          videoUrl={state.ad.url}
          onComplete={handleComplete}
        />
      ) : null}
    </AdContext.Provider>
  )
}

export function useAds() {
  const context = useContext(AdContext)
  if (!context) {
    throw new Error('useAds deve ser usado dentro de AdGateProvider')
  }
  return context
}
