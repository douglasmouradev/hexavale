import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { TRABALHOS_CICLO } from '@/data/fenologia'
import { usePersistedState } from '@/hooks/usePersistedState'
import {
  gerarSemanasCiclo,
  mesclarSemanas,
  totalSemana,
  totaisCiclo,
} from '@/lib/ciclo'
import { formatCurrency, parseDecimal } from '@/lib/format'
import { exportarCicloPdf } from '@/lib/pdf'
import type { CicloCultura, SemanaCiclo } from '@/types/models'

function formatDia(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function CicloCulturaPage() {
  const { propriedade, produtor } = useApp()
  const { showInterstitial } = useAds()
  const [ciclo, setCiclo] = usePersistedState<CicloCultura | null>(
    STORAGE_KEYS.ciclo,
    null,
  )
  const [aberta, setAberta] = useState<number | null>(null)
  const [resumo, setResumo] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const semanas = useMemo(() => {
    const geradas = gerarSemanasCiclo({
      dataColheita: produtor.dataColheita,
      dataInicio: produtor.dataReferencia,
      cultura: produtor.cultura,
    })
    if (!geradas.length) return []
    return mesclarSemanas(geradas, ciclo?.semanas ?? [])
  }, [ciclo?.semanas, produtor.cultura, produtor.dataColheita, produtor.dataReferencia])

  function persistir(next: SemanaCiclo[]) {
    setCiclo({
      id: ciclo?.id ?? 'ciclo-atual',
      cultura: produtor.cultura,
      dataInicio: produtor.dataReferencia,
      dataColheita: produtor.dataColheita,
      semanas: next,
      atualizadoEm: new Date().toISOString(),
    })
  }

  function atualizar(numero: number, patch: Partial<SemanaCiclo>) {
    persistir(
      semanas.map((semana) =>
        semana.numero === numero ? { ...semana, ...patch } : semana,
      ),
    )
  }

  const totais = totaisCiclo(semanas)

  async function handleCalcular() {
    setCalculating(true)
    try {
      persistir(semanas)
      await showInterstitial('calculate')
      setResumo(true)
    } finally {
      setCalculating(false)
    }
  }

  if (!semanas.length) {
    return (
      <Card className="space-y-3">
        <p className="font-bold text-ink">Falta a data do ciclo</p>
        <p className="text-sm text-soil">
          Em Produtor, informe a data de manejo ou a data da colheita.
        </p>
        <Link to="/produtor" className="block">
          <Button full>Abrir Produtor</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card tone="field">
        <p className="text-sm font-bold text-yellow-200">Safra · 42 semanas</p>
        <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totais.geral)}</p>
        <p className="mt-2 text-sm font-semibold text-white">
          Insumos {formatCurrency(totais.insumos)} · Mão de obra{' '}
          {formatCurrency(totais.maoDeObra)} · Máquinas {formatCurrency(totais.mecanizacao)}
        </p>
      </Card>

      {semanas.map((semana) => {
        const abertaAgora = aberta === semana.numero
        const parcial = totalSemana(semana)
        return (
          <Card key={semana.numero} className="space-y-3 p-4">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => setAberta(abertaAgora ? null : semana.numero)}
            >
              <span>
                <span className="block font-bold text-ink">
                  Semana {semana.numero} · {semana.tipoTrabalho || 'Sem lançamento'}
                </span>
                <span className="text-sm text-soil">
                  {formatDia(semana.dataInicio)} a {formatDia(semana.dataFim)}
                </span>
              </span>
              <span className="font-bold text-field-dark">{formatCurrency(parcial)}</span>
            </button>

            {abertaAgora ? (
              <div className="space-y-3 border-t border-cream-dark pt-3">
                <Select
                  label="Trabalho"
                  name={`trabalho-${semana.numero}`}
                  value={semana.tipoTrabalho}
                  onChange={(event) =>
                    atualizar(semana.numero, { tipoTrabalho: event.target.value })
                  }
                >
                  {TRABALHOS_CICLO.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Insumo (R$)"
                  name={`insumo-${semana.numero}`}
                  inputMode="decimal"
                  value={String(semana.insumos[0]?.custo ?? '')}
                  onChange={(event) =>
                    atualizar(semana.numero, {
                      insumos: [
                        {
                          nome: semana.tipoTrabalho || 'Insumo',
                          quantidade: 1,
                          custo: parseDecimal(event.target.value) ?? 0,
                        },
                      ],
                    })
                  }
                />
                <Input
                  label="Mão de obra (R$)"
                  name={`mo-${semana.numero}`}
                  inputMode="decimal"
                  value={
                    semana.maoDeObra[0]
                      ? String(
                          semana.maoDeObra[0].pessoas *
                            semana.maoDeObra[0].diaria *
                            semana.maoDeObra[0].dias,
                        )
                      : ''
                  }
                  onChange={(event) =>
                    atualizar(semana.numero, {
                      maoDeObra: [
                        {
                          descricao: semana.tipoTrabalho || 'Mão de obra',
                          pessoas: 1,
                          diaria: parseDecimal(event.target.value) ?? 0,
                          dias: 1,
                        },
                      ],
                    })
                  }
                />
                <Input
                  label="Máquina (R$)"
                  name={`maq-${semana.numero}`}
                  inputMode="decimal"
                  value={
                    semana.mecanizacao[0]
                      ? String(semana.mecanizacao[0].horas * semana.mecanizacao[0].custoHora)
                      : ''
                  }
                  onChange={(event) =>
                    atualizar(semana.numero, {
                      mecanizacao: [
                        {
                          descricao: 'Trator / pulverizador',
                          horas: 1,
                          custoHora: parseDecimal(event.target.value) ?? 0,
                        },
                      ],
                    })
                  }
                />
              </div>
            ) : null}
          </Card>
        )
      })}

      {resumo ? (
        <Button
          variant="secondary"
          full
          onClick={() => exportarCicloPdf(semanas, totais, propriedade, produtor)}
        >
          Exportar PDF
        </Button>
      ) : null}

      <Button full disabled={calculating} onClick={handleCalcular}>
        {calculating ? 'Gerando...' : 'Calcular'}
      </Button>
    </div>
  )
}
