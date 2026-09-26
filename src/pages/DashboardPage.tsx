/** Home: as quatro calculadoras da mangueira. */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModuleIcon } from '@/components/layout/ModuleIcon'
import { InstalarAppCard } from '@/components/pwa/InstalarAppCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { modulesVisiveis } from '@/data/modules'
import { lancarItensDeTeste } from '@/lib/amostra'

function saudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function inicial(nome: string) {
  const letra = nome.trim().charAt(0)
  return letra ? letra.toLocaleUpperCase('pt-BR') : 'H'
}

export function DashboardPage() {
  const { propriedade, produtor, salvarProdutor } = useApp()
  const [, setCadernoTick] = useState(0)
  const visiveis = modulesVisiveis()
  const nomeDestaque = produtor.nomeResponsavel || propriedade?.nome || 'Produtor'
  const subtitulo = [produtor.nomeResponsavel ? propriedade?.nome : null, produtor.municipio]
    .filter(Boolean)
    .join(' · ')

  useEffect(() => {
    if (produtor.cultura === 'manga') return
    salvarProdutor({ ...produtor, cultura: 'manga' })
    // Só quando a cultura ainda não é manga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtor.cultura])

  function aplicarTeste() {
    salvarProdutor(lancarItensDeTeste({ ...produtor, cultura: 'manga' }))
    setCadernoTick((atual) => atual + 1)
  }

  return (
    <div className="space-y-5">
      <div className="desk:hidden">
        <p className="font-display text-sm font-medium italic text-soil">{saudacao()}</p>
      </div>
      <p className="font-display hidden text-base font-medium italic text-soil desk:block">
        {saudacao()}
      </p>

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mango text-lg font-bold text-white">
            {inicial(nomeDestaque)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight text-field">
              {nomeDestaque}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-soil">
              {subtitulo || 'Mangueira · Vale do São Francisco'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="mb-1 text-sm text-soil">Ferramentas</p>
          <Card className="grid grid-cols-1 gap-px overflow-hidden bg-line p-0">
            {visiveis.map((module) => (
              <Link
                key={module.to}
                to={module.to}
                className="flex min-h-14 items-center gap-3 bg-paper px-4 py-3"
              >
                <ModuleIcon name={module.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug text-field">{module.title}</span>
                  <span className="block text-sm leading-snug text-soil">{module.description}</span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-mango"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <InstalarAppCard />
          <Link to="/meus-dados" className="hidden desk:block">
            <Card>
              <p className="font-medium text-field">Meus dados</p>
              <p className="mt-0.5 text-sm text-soil">Exportar, restaurar ou apagar o caderno</p>
            </Card>
          </Link>
        </div>
      </div>

      {import.meta.env.DEV ? (
        <Button variant="outline" full onClick={aplicarTeste}>
          Lançar itens de teste
        </Button>
      ) : null}

      <Link to="/meus-dados" className="block desk:hidden">
        <Card>
          <p className="font-medium text-field">Meus dados</p>
          <p className="mt-0.5 text-sm text-soil">Exportar, restaurar ou apagar o caderno</p>
        </Card>
      </Link>
    </div>
  )
}
