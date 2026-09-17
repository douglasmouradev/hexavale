/** Texto completo da Política de Privacidade (rota pública, sem login). */
import { Link, useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageTitle } from '@/components/ui/PageTitle'
import { LGPD_CONTATO, POLITICA_ATUALIZADA_EM, POLITICA_SECOES, POLITICA_VERSAO } from '@/data/lgpd'
import { useApp } from '@/context/AppContext'

export function PrivacidadePage() {
  const { propriedade } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-cream px-4 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-lg space-y-5 pb-10 lg:max-w-3xl">
        <div>
          <Wordmark height={32} className="mb-4" />
          <PageTitle
            title="Política de Privacidade"
            subtitle={`Versão ${POLITICA_VERSAO} · ${POLITICA_ATUALIZADA_EM}`}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
        {POLITICA_SECOES.map((secao) => (
          <Card key={secao.titulo} className="space-y-2">
            <h2 className="text-lg font-medium text-ink">{secao.titulo}</h2>
            {secao.paragrafos.map((paragrafo) => (
              <p key={paragrafo} className="text-sm leading-relaxed text-soil">
                {paragrafo}
              </p>
            ))}
          </Card>
        ))}
        </div>

        <Card className="space-y-1">
          <p className="text-sm font-medium text-ink">Contato</p>
          <p className="text-sm text-soil">{LGPD_CONTATO.controlador}</p>
          <a className="block text-sm text-field" href={`mailto:${LGPD_CONTATO.email}`}>
            {LGPD_CONTATO.email}
          </a>
          <a className="block text-sm text-field" href={`tel:+5571997087082`}>
            {LGPD_CONTATO.telefone}
          </a>
        </Card>

        <Button full onClick={() => navigate(propriedade ? '/' : '/login')}>
          Voltar
        </Button>
        {propriedade ? (
          <Link to="/meus-dados" className="block text-center text-sm text-field">
            Ir para Meus dados
          </Link>
        ) : null}
      </div>
    </div>
  )
}
