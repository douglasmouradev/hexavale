/** Texto completo da Política de Privacidade (rota pública, sem login). */
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LGPD_CONTATO, POLITICA_ATUALIZADA_EM, POLITICA_SECOES, POLITICA_VERSAO } from '@/data/lgpd'
import { useApp } from '@/context/AppContext'

export function PrivacidadePage() {
  const { propriedade } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-cream px-4 py-8">
      <div className="mx-auto w-full max-w-lg space-y-5 pb-10">
        <div className="text-center">
          <Logo size={64} className="mx-auto" />
          <h1 className="mt-3 font-display text-[1.85rem] font-bold tracking-tight text-field">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-sm text-soil">
            HexaVale · LGPD · versão {POLITICA_VERSAO} · {POLITICA_ATUALIZADA_EM}
          </p>
        </div>

        {POLITICA_SECOES.map((secao) => (
          <Card key={secao.titulo} className="space-y-2">
            <h2 className="text-lg font-bold text-ink">{secao.titulo}</h2>
            {secao.paragrafos.map((paragrafo) => (
              <p key={paragrafo} className="text-sm leading-relaxed text-soil">
                {paragrafo}
              </p>
            ))}
          </Card>
        ))}

        <Card className="space-y-1">
          <p className="text-sm font-bold text-ink">Contato do controlador</p>
          <p className="text-sm text-soil">{LGPD_CONTATO.controlador}</p>
          <a className="block text-sm font-semibold text-mango" href={`mailto:${LGPD_CONTATO.email}`}>
            {LGPD_CONTATO.email}
          </a>
          <a className="block text-sm font-semibold text-mango" href={`tel:+5571997087082`}>
            {LGPD_CONTATO.telefone}
          </a>
        </Card>

        <Button full onClick={() => navigate(propriedade ? '/' : '/login')}>
          Voltar
        </Button>
        {propriedade ? (
          <Link to="/meus-dados" className="block text-center text-sm font-semibold text-mango">
            Ir para Meus dados
          </Link>
        ) : null}
      </div>
    </div>
  )
}
