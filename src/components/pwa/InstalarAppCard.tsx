/** Convite para a tela inicial — faixa curta, dá para dispensar. */
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useInstalarPwa } from '@/hooks/useInstalarPwa'

const ESCONDER = 'hexavale-esconder-instalar'

export function InstalarAppCard() {
  const { mostrarCartao, podeInstalar, ios, instalar } = useInstalarPwa()
  const [escondido, setEscondido] = useState(() => {
    try {
      return localStorage.getItem(ESCONDER) === '1'
    } catch {
      return false
    }
  })

  if (!mostrarCartao || escondido) return null

  function dispensar() {
    try {
      localStorage.setItem(ESCONDER, '1')
    } catch {
      /* aparelho sem storage */
    }
    setEscondido(true)
  }

  return (
    <div className="flex items-center gap-2 rounded-leaf border border-line bg-paper px-3 py-2 shadow-paper">
      <p className="min-w-0 flex-1 text-sm text-soil">
        {ios ? 'Safari: Compartilhar → Tela de Início.' : 'Instalar na tela inicial.'}
      </p>
      {podeInstalar ? (
        <Button className="min-h-10 shrink-0 px-3 text-sm" onClick={() => void instalar()}>
          Instalar
        </Button>
      ) : null}
      <button
        type="button"
        onClick={dispensar}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-leaf text-soil"
        aria-label="Dispensar"
      >
        ×
      </button>
    </div>
  )
}
