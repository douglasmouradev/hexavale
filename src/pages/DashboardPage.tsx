/** Home: semana e custo; ferramentas em linha de caderno, sem ícone colorido. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InstalarAppCard } from '@/components/pwa/InstalarAppCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Metric } from '@/components/ui/Metric'
import { useApp } from '@/context/AppContext'
import { APP_MODULES, culturaLabel } from '@/data/modules'
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

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-soil">{saudacao()}</p>
        <h1 className="font-display text-[1.85rem] leading-tight font-bold text-field">
          {propriedade?.nome}
        </h1>
      </div>

      <Card tone="field" className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-mango-light">
              {atual
                ? `Semana ${atual.numero} de 42`
                : temData
                  ? culturaLabel(produtor.cultura)
                  : 'Ciclo ainda sem data'}
            </p>
            <p className="mt-1 font-display text-2xl font-bold leading-snug text-white">
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

      <InstalarAppCard />

      {ultimaSafra ? (
        <Link to="/ciclo" className="block">
          <Card>
            <p className="text-sm text-soil">Última safra fechada</p>
            <p className="mt-1 font-display text-lg font-bold text-field">
              {culturaLabel(ultimaSafra.cultura)} · {formatCurrency(ultimaSafra.totais.geral)}
            </p>
            <p className="mt-1 text-sm text-soil">
              {new Date(ultimaSafra.fechadaEm).toLocaleDateString('pt-BR')}
            </p>
          </Card>
        </Link>
      ) : null}

      <div>
        <p className="mb-1 text-sm text-soil">Ferramentas</p>
        <Card className="p-0">
          {APP_MODULES.map((module) => (
            <Link
              key={module.to}
              to={module.to}
              className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 last:border-0 active:bg-cream"
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

      <Button variant="outline" full onClick={aplicarTeste}>
        Lançar itens de teste
      </Button>

      <Link to="/meus-dados" className="block">
        <Card>
          <p className="font-medium text-field">Meus dados</p>
          <p className="mt-0.5 text-sm text-soil">Exportar, restaurar ou apagar o caderno</p>
        </Card>
      </Link>
    </div>
  )
}
