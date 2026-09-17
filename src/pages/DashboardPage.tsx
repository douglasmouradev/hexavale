/** Home: semana e custo; ferramentas em linha de caderno, sem ícone colorido. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InstalarAppCard } from '@/components/pwa/InstalarAppCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Metric } from '@/components/ui/Metric'
import { useApp } from '@/context/AppContext'
import { MODULE_GROUPS, culturaLabel, modulesVisiveis } from '@/data/modules'
import { STORAGE_KEYS } from '@/data/constants'
import { lancarItensDeTeste } from '@/lib/amostra'
import { formatCurrency } from '@/lib/format'
import { gerarSemanasCiclo, mesclarSemanas, semanaHoje, totaisCiclo } from '@/lib/ciclo'
import { lerSafras } from '@/lib/safra'
import { readStore } from '@/storage/localStore'
import type { CaldaFormState } from '@/hooks/useCaldaForm'
import type { CicloCultura } from '@/types/models'

function saudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDia(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function DashboardPage() {
  const { propriedade, produtor, salvarProdutor } = useApp()
  const [cadernoTick, setCadernoTick] = useState(0)

  function aplicarTeste() {
    salvarProdutor(lancarItensDeTeste(produtor))
    setCadernoTick((atual) => atual + 1)
  }

  const calda = readStore<CaldaFormState>(STORAGE_KEYS.calda)
  const cicloSalvo = readStore<CicloCultura>(STORAGE_KEYS.ciclo)
  void cadernoTick
  const temData = Boolean(produtor.dataColheita || produtor.dataReferencia)
  const geradas = gerarSemanasCiclo({
    dataColheita: produtor.dataColheita,
    dataInicio: produtor.dataReferencia,
    cultura: produtor.cultura,
  })
  const semanas = geradas.length
    ? mesclarSemanas(geradas, cicloSalvo?.semanas ?? [])
    : []
  const atual = semanaHoje(semanas)
  const totais = semanas.length ? totaisCiclo(semanas) : null
  const progresso = atual ? Math.round((atual.numero / 42) * 100) : 0
  const ultimaSafra = lerSafras()[0]

  const visiveis = modulesVisiveis(produtor.cultura)
  const mangaTools = visiveis.filter((module) => module.group === 'manga')

  return (
    <div className="space-y-5">
      <div className="desk:hidden">
        <p className="font-display text-base font-medium italic text-soil">{saudacao()}</p>
        <h1 className="font-display text-[1.9rem] leading-[1.15] font-semibold text-field">
          {propriedade?.nome}
        </h1>
      </div>
      <p className="font-display hidden text-base font-medium italic text-soil desk:block">
        {saudacao()}
      </p>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card tone="field" className="space-y-4 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-mango-light">
                {atual
                  ? `Semana ${atual.numero} de 42`
                  : temData
                    ? culturaLabel(produtor.cultura)
                    : 'Ciclo ainda sem data'}
              </p>
              <p className="mt-1 font-display text-[1.7rem] font-semibold leading-[1.2] text-white">
                {atual
                  ? atual.tipoTrabalho
                  : temData
                    ? 'Fora das 42 semanas'
                    : 'Defina a data em Produtor'}
              </p>
              {atual ? (
                <p className="mt-1 text-sm text-white/70">
                  {formatDia(atual.dataInicio)} a {formatDia(atual.dataFim)}
                </p>
              ) : null}
            </div>
            {atual ? (
              <span className="text-sm font-medium text-white/80">{progresso}%</span>
            ) : null}
          </div>

          <div className="h-px bg-white/20">
            <div className="h-px bg-mango" style={{ width: `${atual ? progresso : 0}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Metric invert label="Custo do ciclo" value={formatCurrency(totais?.geral ?? 0)} />
            <Metric
              invert
              label="Última calda"
              value={
                calda?.resultado ? `${calda.resultado.tanquesNecessarios} tanque(s)` : '—'
              }
            />
          </div>

          {totais && totais.geral > 0 ? (
            <GraficoPizza
              invert
              centro={formatCurrency(totais.geral)}
              formatValor={formatCurrency}
              fatias={[
                { label: 'Insumos', value: totais.insumos },
                { label: 'Mão de obra', value: totais.maoDeObra },
                { label: 'Máquinas', value: totais.mecanizacao },
              ]}
            />
          ) : null}

          <Link to={temData ? '/ciclo' : '/produtor'} className="block">
            <Button full variant="secondary">
              {temData ? 'Abrir ciclo' : 'Definir datas'}
            </Button>
          </Link>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <InstalarAppCard />

          {ultimaSafra ? (
            <Link to="/ciclo" className="block">
              <Card>
                <p className="text-sm text-soil">Última safra fechada</p>
                <p className="mt-1 font-display text-lg font-semibold text-field">
                  {culturaLabel(ultimaSafra.cultura)} · {formatCurrency(ultimaSafra.totais.geral)}
                </p>
                <p className="mt-1 text-sm text-soil">
                  {new Date(ultimaSafra.fechadaEm).toLocaleDateString('pt-BR')}
                </p>
              </Card>
            </Link>
          ) : null}

          <Link to="/meus-dados" className="hidden desk:block">
            <Card>
              <p className="font-medium text-field">Meus dados</p>
              <p className="mt-0.5 text-sm text-soil">Exportar, restaurar ou apagar o caderno</p>
            </Card>
          </Link>
        </div>
      </div>

      <div className="desk:hidden">
        {mangaTools.length ? (
          <div className="mb-5">
            <p className="mb-1 text-sm text-soil">Mangueira</p>
            <div className="flex flex-wrap gap-2">
              {mangaTools.map((module) => (
                <Link
                  key={module.to}
                  to={module.to}
                  className="rounded-chip bg-paper px-3 py-2 text-sm font-medium text-field shadow-paper"
                >
                  {module.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {MODULE_GROUPS.filter((group) => group.id === 'caderno').map((group) => {
          const itens = visiveis.filter((module) => module.group === group.id)
          if (!itens.length) return null
          return (
            <div key={group.id}>
              <p className="mb-1 text-sm text-soil">{group.label}</p>
              <Card className="grid grid-cols-1 gap-px overflow-hidden bg-line p-0">
                {itens.map((module) => (
                  <Link
                    key={module.to}
                    to={module.to}
                    className="flex items-baseline justify-between gap-3 bg-paper px-4 py-3 hover:bg-cream"
                  >
                    <span>
                      <span className="block font-medium text-field">{module.title}</span>
                      <span className="block text-sm text-soil">{module.description}</span>
                    </span>
                    <span className="text-sm text-mango">Abrir</span>
                  </Link>
                ))}
              </Card>
            </div>
          )
        })}
      </div>
      <p className="hidden text-sm text-soil desk:block">
        As ferramentas estão no menu à esquerda.
      </p>

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
