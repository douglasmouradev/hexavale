/** Custo da calda em kg e R$: tanque, litro e hectare, em 3 etapas. */
import { useRef, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageSplit } from '@/components/layout/PageSplit'
import { StickyAction, scrollAoResultado } from '@/components/layout/StickyAction'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Input } from '@/components/ui/Input'
import { Metric } from '@/components/ui/Metric'
import { useAds } from '@/context/AdContext'
import { STORAGE_KEYS } from '@/data/constants'
import { useSessionState } from '@/hooks/useSessionState'
import type { CaldaFormState } from '@/hooks/useCaldaForm'
import {
  calcularCustoCalda,
  parseCustoCaldaCampos,
  type ResultadoCustoCalda,
} from '@/lib/custoCalda'
import { formatCurrency, formatNumber, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import { readStore } from '@/storage/localStore'

interface InsumoForm {
  id: string
  nome: string
  qtd: string
  valorUnit: string
}

interface CustoCaldaState {
  tankVolume: string
  volPerHa: string
  numApps: string
  insumos: InsumoForm[]
  resultado: ResultadoCustoCalda | null
}

function emptyInsumo(): InsumoForm {
  return { id: createId(), nome: '', qtd: '', valorUnit: '' }
}

const EXEMPLO: CustoCaldaState = {
  tankVolume: '10000',
  volPerHa: '200',
  numApps: '40',
  insumos: [
    { id: createId(), nome: 'Esterco', qtd: '150', valorUnit: '0,32' },
    { id: createId(), nome: 'Farinha de ossos', qtd: '10', valorUnit: '1' },
    { id: createId(), nome: 'Torta de mamona', qtd: '100', valorUnit: '2' },
    { id: createId(), nome: 'Cinzas de madeira', qtd: '50', valorUnit: '1,20' },
    { id: createId(), nome: 'Pó de rocha (Rochagem)', qtd: '100', valorUnit: '0,54' },
  ],
  resultado: null,
}

const INITIAL: CustoCaldaState = {
  tankVolume: '',
  volPerHa: '',
  numApps: '',
  insumos: [emptyInsumo()],
  resultado: null,
}

function totalInsumo(item: InsumoForm) {
  return (parseDecimal(item.qtd) ?? 0) * (parseDecimal(item.valorUnit) ?? 0)
}

export function CustoCaldaPage() {
  const { showInterstitial } = useAds()
  const [form, setForm] = useSessionState(STORAGE_KEYS.custoCalda, INITIAL)
  const [error, setError] = useState('')
  const [etapa, setEtapa] = useState<1 | 2 | 3>(form.resultado ? 3 : 1)
  const resultRef = useRef<HTMLDivElement>(null)

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (etapa === 1) {
      irParaInsumos()
      return
    }
    if (etapa !== 2) return
    const campos = parseCustoCaldaCampos(form)
    if ('error' in campos) {
      setError(campos.error)
      setForm((current) => ({ ...current, resultado: null }))
      setEtapa(1)
      return
    }

    const insumos = []
    for (const item of form.insumos) {
      const nome = item.nome.trim()
      const qtd = parseDecimal(item.qtd) ?? 0
      const valorUnit = parseDecimal(item.valorUnit) ?? 0
      if (!nome && qtd <= 0 && valorUnit <= 0) continue
      if (!nome) {
        setError('Informe o nome de cada insumo lançado.')
        setForm((current) => ({ ...current, resultado: null }))
        setEtapa(2)
        return
      }
      insumos.push({ id: item.id, nome, qtd, valorUnit })
    }

    if (insumos.length === 0) {
      setError('Lance pelo menos um insumo em kg.')
      setForm((current) => ({ ...current, resultado: null }))
      setEtapa(2)
      return
    }

    setError('')
    const resultado = calcularCustoCalda({ ...campos, insumos })
    setForm((current) => ({ ...current, resultado }))
    setEtapa(3)
    scrollAoResultado(resultRef.current)
    void showInterstitial('calculate')
  }

  function irParaInsumos() {
    const campos = parseCustoCaldaCampos(form)
    if ('error' in campos) {
      setError(campos.error)
      return
    }
    setError('')
    setEtapa(2)
  }

  const resultado = form.resultado
  const calda = readStore<CaldaFormState>(STORAGE_KEYS.calda)
  const tanqueCalda = calda?.tanqueLitros?.trim() || ''
  const lhaCalda = calda?.litrosPorHectare?.trim() || ''
  const podeCopiarTanque = Boolean(tanqueCalda || lhaCalda)
  const volPerHa = parseDecimal(form.volPerHa)
  const numApps = parseDecimal(form.numApps)
  const volumeCicloPreview =
    volPerHa !== null && numApps !== null && volPerHa > 0 && numApps > 0
      ? volPerHa * numApps
      : null
  const totalKgPreview = form.insumos.reduce(
    (sum, item) => sum + (parseDecimal(item.qtd) ?? 0),
    0,
  )
  const totalRsPreview = form.insumos.reduce((sum, item) => sum + totalInsumo(item), 0)

  function copiarTanqueDaCalda() {
    setForm((current) => ({
      ...current,
      tankVolume: tanqueCalda || current.tankVolume,
      volPerHa: lhaCalda || current.volPerHa,
      resultado: null,
    }))
  }

  function limparReceita() {
    setForm((current) => ({
      ...current,
      insumos: [emptyInsumo()],
      resultado: null,
    }))
  }

  const fatiasCusto = form.insumos
    .map((item) => ({
      label: item.nome.trim(),
      value: totalInsumo(item),
      detalhe: `${formatNumber(parseDecimal(item.qtd) ?? 0)} kg`,
    }))
    .filter((fatia) => fatia.label && fatia.value > 0)

  const fatiasVolume = form.insumos
    .map((item) => ({
      label: item.nome.trim(),
      value: parseDecimal(item.qtd) ?? 0,
      detalhe: formatCurrency(totalInsumo(item)),
    }))
    .filter((fatia) => fatia.label && fatia.value > 0)

  const resultadoCard = resultado ? (
    <div ref={resultRef} className="space-y-4">
      <Card tone="field" className="space-y-4">
        <Metric
          invert
          label="Valor da operação (por hectare, no ciclo)"
          value={formatCurrency(resultado.valorOperacaoHa)}
          hint={`${formatNumber(resultado.volumeCiclo, 0)} L aplicados no ciclo`}
        />
      </Card>
      <Card className="space-y-4">
        <Metric
          label="Custo total dos insumos"
          value={formatCurrency(resultado.totalValor)}
          hint={`${formatNumber(resultado.totalQtd, 1)} kg de insumos no tanque`}
        />
        <Metric
          label="Valor do litro da calda"
          value={formatCurrency(resultado.valorLitro)}
          hint={`Para um tanque de ${formatNumber(resultado.tankVolume, 0)} L`}
        />
        <Metric
          label="Custo por ha / aplicação"
          value={formatCurrency(
            resultado.valorHaAplicacao ?? resultado.valorLitro * resultado.volPerHa,
          )}
          hint={`${formatNumber(resultado.volPerHa, 0)} L por hectare`}
        />
        {resultado.maiorCusto ? (
          <Metric
            label="Maior participação no custo"
            value={resultado.maiorCusto.nome}
            hint={`${formatNumber(resultado.maiorCusto.pct, 1)}% do custo total`}
          />
        ) : null}
        {resultado.maiorVolume ? (
          <Metric
            label="Maior volume utilizado"
            value={resultado.maiorVolume.nome}
            hint={`${formatNumber(resultado.maiorVolume.qtd)} kg`}
          />
        ) : null}
      </Card>
      {fatiasVolume.length ? (
        <Card className="space-y-3">
          <p className="text-sm font-medium leading-snug text-soil">
            Distribuição do volume de insumos
          </p>
          <GraficoPizza
            centro={`${formatNumber(resultado.totalQtd, 1)} kg`}
            formatValor={(value) => `${formatNumber(value)} kg`}
            rotuloParte="do volume"
            fatias={fatiasVolume}
          />
        </Card>
      ) : null}
      {fatiasCusto.length ? (
        <Card className="space-y-3">
          <p className="text-sm font-medium leading-snug text-soil">
            Participação dos insumos no custo
          </p>
          <GraficoPizza
            centro={formatCurrency(resultado.totalValor)}
            formatValor={formatCurrency}
            fatias={fatiasCusto}
          />
        </Card>
      ) : null}
      <Button type="button" variant="outline" full onClick={() => setEtapa(2)}>
        Editar receita
      </Button>
    </div>
  ) : null

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      <PageSplit aside={etapa === 3 ? resultadoCard : null}>
        {etapa === 1 ? (
          <Card className="space-y-3">
            <p className="text-sm text-soil">Etapa 1 de 3 · Tanque e aplicação</p>
            <p className="text-sm text-soil">
              Aqui o custo entra em kg e R$/kg, como na planilha da calda orgânica. A tela Calda
              monta a dose (ml/L, g/L); esta calcula o valor do tanque e da operação no ciclo.
            </p>
            <Button
              type="button"
              variant="ghost"
              full
              onClick={() =>
                setForm({
                  tankVolume: EXEMPLO.tankVolume,
                  volPerHa: EXEMPLO.volPerHa,
                  numApps: EXEMPLO.numApps,
                  insumos: EXEMPLO.insumos.map((item) => ({ ...item, id: createId() })),
                  resultado: null,
                })
              }
            >
              Usar receita de exemplo
            </Button>
            {podeCopiarTanque ? (
              <Button type="button" variant="outline" full onClick={copiarTanqueDaCalda}>
                Usar tanque já informado
                {tanqueCalda ? ` (${tanqueCalda} L` : ''}
                {lhaCalda ? `${tanqueCalda ? ', ' : ' ('}${lhaCalda} L/ha` : ''}
                {tanqueCalda || lhaCalda ? ')' : ''}
              </Button>
            ) : null}
            <Input
              label="Volume do tanque (L)"
              name="tankVolume"
              inputMode="decimal"
              value={form.tankVolume}
              onChange={(event) => setForm({ ...form, tankVolume: event.target.value })}
            />
            <Input
              label="Volume aplicado por hectare (L)"
              name="volPerHa"
              inputMode="decimal"
              value={form.volPerHa}
              onChange={(event) => setForm({ ...form, volPerHa: event.target.value })}
            />
            <Input
              label="Nº de aplicações no ciclo"
              name="numApps"
              inputMode="numeric"
              value={form.numApps}
              onChange={(event) => setForm({ ...form, numApps: event.target.value })}
            />
            {volumeCicloPreview !== null ? (
              <div className="flex items-center justify-between gap-3 rounded-leaf bg-field/10 px-4 py-3">
                <span className="min-w-0 text-sm leading-snug font-medium text-field">
                  Volume no ciclo
                </span>
                <span className="shrink-0 font-display text-lg font-semibold tabular-nums text-field">
                  {formatNumber(volumeCicloPreview, 0)} L/ha
                </span>
              </div>
            ) : null}
          </Card>
        ) : null}

        {etapa === 2 ? (
          <>
            <button
              type="button"
              className="text-sm font-semibold text-field"
              onClick={() => setEtapa(1)}
            >
              ← Tanque e aplicação
            </button>
            <p className="text-sm text-soil">Etapa 2 de 3 · Receita do tanque</p>
            {form.insumos.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 font-display text-lg font-semibold leading-tight text-field">
                    {item.nome.trim() || 'Insumo'}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-semibold text-danger"
                    onClick={() =>
                      setForm({
                        ...form,
                        insumos:
                          form.insumos.length > 1
                            ? form.insumos.filter((linha) => linha.id !== item.id)
                            : [emptyInsumo()],
                      })
                    }
                  >
                    Excluir
                  </button>
                </div>
                <Input
                  label="Nome"
                  name={`nome-${item.id}`}
                  placeholder="Nome do insumo"
                  value={item.nome}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      insumos: form.insumos.map((linha) =>
                        linha.id === item.id ? { ...linha, nome: event.target.value } : linha,
                      ),
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Qtd. (kg)"
                    name={`qtd-${item.id}`}
                    inputMode="decimal"
                    value={item.qtd}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        insumos: form.insumos.map((linha) =>
                          linha.id === item.id ? { ...linha, qtd: event.target.value } : linha,
                        ),
                      })
                    }
                  />
                  <Input
                    label="Valor unit. (R$)"
                    name={`vu-${item.id}`}
                    inputMode="decimal"
                    value={item.valorUnit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        insumos: form.insumos.map((linha) =>
                          linha.id === item.id ? { ...linha, valorUnit: event.target.value } : linha,
                        ),
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-soil">Total (R$)</span>
                  <span className="font-semibold text-field">{formatCurrency(totalInsumo(item))}</span>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              full
              onClick={() => setForm({ ...form, insumos: [...form.insumos, emptyInsumo()] })}
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar insumo
            </Button>
            <Button type="button" variant="ghost" full onClick={limparReceita}>
              Limpar receita
            </Button>
            {totalKgPreview > 0 || totalRsPreview > 0 ? (
              <div className="flex items-center justify-between gap-3 rounded-leaf bg-field/10 px-4 py-3">
                <span className="min-w-0 text-sm leading-snug font-medium text-field">
                  Total da receita
                </span>
                <span className="shrink-0 text-right font-display text-lg font-semibold tabular-nums text-field">
                  {formatNumber(totalKgPreview, 1)} kg
                  <span className="mt-0.5 block text-sm font-medium">
                    {formatCurrency(totalRsPreview)}
                  </span>
                </span>
              </div>
            ) : null}
          </>
        ) : null}

        {etapa === 3 ? (
          <Card className="hidden space-y-3 desk:block">
            <p className="text-sm text-soil">Etapa 3 de 3 · Resultado</p>
            <p className="text-sm text-soil">
              Tanque de {formatNumber(resultado?.tankVolume ?? 0, 0)} L ·{' '}
              {formatNumber(resultado?.volPerHa ?? 0, 0)} L/ha · {formatNumber(resultado?.numApps ?? 0, 0)} aplicações
            </p>
            <Button type="button" variant="outline" full onClick={() => setEtapa(1)}>
              Voltar ao tanque
            </Button>
            <Button type="button" variant="ghost" full onClick={() => setEtapa(2)}>
              Editar insumos
            </Button>
          </Card>
        ) : null}

        {error ? <Banner tone="danger">{error}</Banner> : null}

        {etapa === 1 ? (
          <StickyAction>
            <Button type="button" variant="secondary" full onClick={irParaInsumos}>
              Continuar
            </Button>
          </StickyAction>
        ) : null}

        {etapa === 2 ? (
          <StickyAction>
            <Button type="submit" variant="secondary" full>
              Calcular
            </Button>
          </StickyAction>
        ) : null}
      </PageSplit>
    </form>
  )
}
