/** Home: cartão do produtor, semana e ferramentas do campo com ícone. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PrimeirosPassos } from '@/components/caderno/PrimeirosPassos'
import { ModuleIcon } from '@/components/layout/ModuleIcon'
import { InstalarAppCard } from '@/components/pwa/InstalarAppCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Metric } from '@/components/ui/Metric'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { culturaLabel, modulesVisiveis } from '@/data/modules'
import { lancarItensDeTeste } from '@/lib/amostra'
import { contarPlantasInsumos } from '@/lib/caderno'
import { gerarSemanasCiclo, mesclarSemanas, semanaHoje, totaisCiclo } from '@/lib/ciclo'
import { formatCurrency, formatNumber, parseDecimal } from '@/lib/format'
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

function inicial(nome: string) {
  const letra = nome.trim().charAt(0)
  return letra ? letra.toLocaleUpperCase('pt-BR') : 'H'
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
  const precisaSetup = !produtor.cultura || !temData
  const nomeDestaque = produtor.nomeResponsavel || propriedade?.nome || 'Produtor'
  const subtitulo = [
    produtor.nomeResponsavel ? propriedade?.nome : null,
    produtor.municipio,
  ]
    .filter(Boolean)
    .join(' · ')
  const area = parseDecimal(produtor.areaHectares ?? '')
  const plantas = contarPlantasInsumos()

  return (
    <div className="space-y-5">
      <div className="desk:hidden">
        <p className="font-display text-sm font-medium italic text-soil">{saudacao()}</p>
      </div>
      <p className="font-display hidden text-base font-medium italic text-soil desk:block">
        {saudacao()}
      </p>

      <Link to="/produtor" className="block">
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
                {subtitulo || 'Toque para completar o cadastro'}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-soil uppercase">
                Talhões
              </p>
              <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-field">
                {produtor.talhoes?.trim() || '—'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-soil uppercase">Área</p>
              <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-field">
                {area === null ? '—' : `${formatNumber(area, 1)}ha`}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-soil uppercase">
                Plantas
              </p>
              <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-field">
                {plantas === null ? '—' : formatNumber(plantas, 0)}
              </p>
            </div>
          </div>
        </Card>
      </Link>

      <div className="grid gap-5 lg:grid-cols-5">
        {precisaSetup ? (
          <div className="lg:col-span-3">
            <PrimeirosPassos />
          </div>
        ) : (
        <Card tone="field" className="space-y-4 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
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
              <span className="shrink-0 text-sm font-medium text-white/80">{progresso}%</span>
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

          <div className="grid grid-cols-2 gap-2">
            <Link to="/mao-de-obra" className="block">
              <Button full variant="secondary">
                Lançar diária
              </Button>
            </Link>
            <Link to="/insumos" className="block">
              <Button full variant="outline" className="border-white/30 bg-white/10 text-white">
                Lançar insumo
              </Button>
            </Link>
          </div>
          <Link to="/ciclo" className="block">
            <Button full variant="ghost" className="text-mango-light">
              Abrir ciclo
            </Button>
          </Link>
        </Card>
        )}

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

      <div>
        <p className="mb-1 text-sm text-soil">Ferramentas do campo</p>
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

      <Button variant="outline" full onClick={aplicarTeste}>
        Lançar itens de teste
      </Button>

      <Link to="/meus-dados" className="block desk:hidden">
        <Card>
          <p className="font-medium text-field">Meus dados</p>
          <p className="mt-0.5 text-sm text-soil">Exportar, restaurar ou apagar o caderno</p>
        </Card>
      </Link>
    </div>
  )
}
