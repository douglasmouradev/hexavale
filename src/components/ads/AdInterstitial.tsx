/** Vídeo do anúncio; timer só corre com URL válida. */
import { useEffect, useState } from 'react'
import { getAdPolicy, type AdPlacement } from '@/lib/ads'
import { Button } from '@/components/ui/Button'

interface AdInterstitialProps {
  placement: AdPlacement
  titulo: string
  videoUrl: string
  onComplete: () => void
}

export function AdInterstitial({
  placement,
  titulo,
  videoUrl,
  onComplete,
}: AdInterstitialProps) {
  const policy = getAdPolicy(placement)
  const [secondsLeft, setSecondsLeft] = useState(policy.durationSeconds)
  const elapsed = policy.durationSeconds - secondsLeft
  const canSkip = elapsed >= policy.skipAfterSeconds

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete()
      return
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [onComplete, secondsLeft])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/90 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-title"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-leaf bg-paper shadow-lift">
        <div className="border-b border-line bg-field px-4 py-2 text-sm font-medium text-white">
          Publicidade
        </div>

        <div className="space-y-4 p-4">
          <h2 id="ad-title" className="font-display text-lg font-bold text-ink">
            {titulo}
          </h2>

          <video
            src={videoUrl}
            className="aspect-video w-full rounded-leaf bg-ink"
            autoPlay
            playsInline
            controls={false}
            onEnded={() => {
              if (canSkip) onComplete()
            }}
          />

          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-2xl font-bold text-field">{secondsLeft}s</p>
            <p className="flex-1 text-sm text-soil">
              {canSkip
                ? 'Pode seguir.'
                : `Pular libera em ${Math.max(policy.skipAfterSeconds - elapsed, 0)}s`}
            </p>
          </div>

          <Button full disabled={!canSkip} onClick={onComplete}>
            {canSkip ? 'Seguir' : `Aguarde ${policy.skipAfterSeconds - elapsed}s`}
          </Button>
        </div>
      </div>
    </div>
  )
}
