/**
 * Quem já estava logado sem aceite da política atual precisa aceitar ou apagar os dados.
 * Recusar dispara a exclusão neste aparelho.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { POLITICA_VERSAO } from '@/data/lgpd'

export function ConsentGate() {
  const { propriedade, consentimentoValido, aceitarPrivacidade, apagarMeusDados } = useApp()
  const navigate = useNavigate()
  const [aceite, setAceite] = useState(false)

  if (!propriedade || consentimentoValido) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgpd-title"
    >
      <div className="w-full max-w-md space-y-4 rounded-leaf bg-paper p-5 shadow-lift">
        <h2 id="lgpd-title" className="font-display text-2xl font-bold text-field">
          Antes de continuar
        </h2>
        <p className="text-sm leading-relaxed text-soil">
          Telefone, propriedade e caderno ficam neste aparelho. Para seguir, aceite a política
          (versão {POLITICA_VERSAO}).
        </p>
        <label className="flex items-start gap-3 border border-line px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-field"
            checked={aceite}
            onChange={(event) => setAceite(event.target.checked)}
          />
          <span className="text-sm font-medium text-ink">
            Li e aceito a Política de Privacidade.
          </span>
        </label>
        <Link to="/privacidade" className="block text-sm text-field">
          Ler o texto
        </Link>
        <Button full disabled={!aceite} onClick={() => aceitarPrivacidade()}>
          Aceitar e continuar
        </Button>
        <Button
          full
          variant="outline"
          onClick={() => {
            apagarMeusDados()
            navigate('/login', { replace: true })
          }}
        >
          Recusar e apagar meus dados
        </Button>
      </div>
    </div>
  )
}
