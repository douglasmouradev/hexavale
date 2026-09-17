/** Vídeo do anúncio já escolhido pelo painel; o timer só corre com URL válida. */
import { useEffect, useState } from 'react'
import { getAdPolicy, type AdPlacement } from '@/lib/ads'

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
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-paper shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="bg-field px-5 py-3 text-center text-xs font-bold tracking-[0.2em] text-white uppercase">
          Publicidade
        </div>

        <div className="space-y-4 p-4">
          <h2 id="ad-title" className="px-1 text-lg font-bold text-ink">
            {titulo}
          </h2>

          <video
            src={videoUrl}
            className="aspect-video w-full rounded-2xl bg-ink"
            autoPlay
            playsInline
            controls={false}
            onEnded={() => {
              if (canSkip) onComplete()
            }}
          />

          <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-field text-xl font-bold text-field-dark">
              {secondsLeft}
            </div>
            <p className="flex-1 text-sm text-soil">
              {canSkip
                ? 'Pode seguir.'
                : `Pular libera em ${Math.max(policy.skipAfterSeconds - elapsed, 0)}s`}
            </p>
          </div>

          <button
            type="button"
            disabled={!canSkip}
            onClick={onComplete}
            className="min-h-14 w-full rounded-2xl bg-field text-base font-bold text-white transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-cream-dark disabled:text-soil/50"
          >
            {canSkip ? 'Seguir' : `Aguarde ${policy.skipAfterSeconds - elapsed}s`}
          </button>
          <p className="px-1 text-center text-xs text-soil">
            Este anúncio não envia seu telefone, nome nem o caderno.
          </p>
        </div>
      </div>
    </div>
  )
}
