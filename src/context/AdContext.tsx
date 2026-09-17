import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AdInterstitial } from '@/components/ads/AdInterstitial'
import type { AdPlacement } from '@/services/ads/AdService'

interface AdContextValue {
  showInterstitial: (placement: AdPlacement) => Promise<void>
}

const AdContext = createContext<AdContextValue | null>(null)

interface InterstitialState {
  open: boolean
  placement: AdPlacement
  resolve: (() => void) | null
}

const INITIAL: InterstitialState = {
  open: false,
  placement: 'login',
  resolve: null,
}

export function AdGateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterstitialState>(INITIAL)

  const showInterstitial = useCallback((placement: AdPlacement) => {
    return new Promise<void>((resolve) => {
      setState({
        open: true,
        placement,
        resolve,
      })
    })
  }, [])

  const handleComplete = useCallback(() => {
    setState((current) => {
      current.resolve?.()
      return INITIAL
    })
  }, [])

  const value = useMemo(() => ({ showInterstitial }), [showInterstitial])

  return (
    <AdContext.Provider value={value}>
      {children}
      {state.open ? (
        <AdInterstitial
          placement={state.placement}
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
