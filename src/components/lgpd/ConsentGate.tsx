/**
 * Quem já estava logado sem aceite da política atual precisa aceitar ou apagar os dados.
 * Recusar dispara a exclusão LGPD neste aparelho.
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
      <div className="w-full max-w-md space-y-4 rounded-[1.75rem] bg-paper p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-bold tracking-[0.2em] text-mango uppercase">LGPD</p>
        <h2 id="lgpd-title" className="font-display text-2xl font-bold text-field">
          Antes de continuar
        </h2>
        <p className="text-sm leading-relaxed text-soil">
          O HexaVale guarda telefone, nome da propriedade e o caderno neste aparelho. Não
          enviamos isso ao servidor. Para seguir, aceite a Política de Privacidade (versão{' '}
          {POLITICA_VERSAO}).
        </p>
        <label className="flex items-start gap-3 rounded-2xl bg-cream/80 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-field"
            checked={aceite}
            onChange={(event) => setAceite(event.target.checked)}
          />
          <span className="text-sm font-semibold text-ink">
            Li e aceito a Política de Privacidade (versão {POLITICA_VERSAO}).
          </span>
        </label>
        <Link to="/privacidade" className="block text-center text-sm font-semibold text-mango">
          Ler o texto completo
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
