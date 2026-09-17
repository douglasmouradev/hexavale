/** Aviso quando o aparelho recusa gravar o caderno (cota cheia ou storage bloqueado). */
import { useEffect, useState } from 'react'
import { Banner } from '@/components/ui/Banner'
import {
  CADERNO_ERRO_EVENTO,
  type MotivoCadernoErro,
} from '@/storage/localStore'

const TEXTOS: Record<MotivoCadernoErro, string> = {
  cota: 'Não coube gravar o caderno neste aparelho. Exporte uma cópia em Meus dados ou apague safras antigas.',
  invalido: 'Não foi possível gravar o caderno neste aparelho.',
}

export function CadernoAviso() {
  const [motivo, setMotivo] = useState<MotivoCadernoErro | null>(null)

  useEffect(() => {
    function onErro(event: Event) {
      const detalhe = (event as CustomEvent<MotivoCadernoErro>).detail
      setMotivo(detalhe === 'cota' ? 'cota' : 'invalido')
    }
    window.addEventListener(CADERNO_ERRO_EVENTO, onErro)
    return () => window.removeEventListener(CADERNO_ERRO_EVENTO, onErro)
  }, [])

  if (!motivo) return null

  return (
    <div className="px-4 pt-3 desk:px-8">
      <Banner tone="danger" role="alert">
        {TEXTOS[motivo]}
      </Banner>
      <button
        type="button"
        className="mt-1 text-sm text-danger underline"
        onClick={() => setMotivo(null)}
      >
        Fechar aviso
      </button>
    </div>
  )
}
