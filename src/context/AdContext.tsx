/**
 * Anúncio em tela cheia. No cálculo respeita 15 min; no login entra sempre.
 * Pedidos simultâneos (login + home) compartilham o mesmo filme.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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
  showInterstitial: (placement: AdPlacement) => Promise<boolean>
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
  const pendente = useRef<Promise<boolean> | null>(null)

  const showInterstitial = useCallback(async (placement: AdPlacement) => {
    if (placement !== 'login' && adEmCooldown()) return false
    if (pendente.current) return pendente.current

    const run = (async () => {
      try {
        const ad = await fetchCurrentAd()
        if (!ad?.url) return false

        await new Promise<void>((resolve) => {
          setState({
            open: true,
            placement,
            ad,
            resolve,
          })
        })
        return true
      } finally {
        pendente.current = null
      }
    })()

    pendente.current = run
    return run
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
