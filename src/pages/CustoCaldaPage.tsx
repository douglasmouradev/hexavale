/** Custo da calda em kg e R$: tanque, litro e hectare no ciclo. */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageSplit } from '@/components/layout/PageSplit'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Input } from '@/components/ui/Input'
import { Metric } from '@/components/ui/Metric'
import { Row } from '@/components/ui/Row'
import { useAds } from '@/context/AdContext'
import { STORAGE_KEYS } from '@/data/constants'
import { usePersistedState } from '@/hooks/usePersistedState'
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

const INITIAL: CustoCaldaState = {
  tankVolume: '10000',
  volPerHa: '200',
  numApps: '40',
  insumos: [
    { id: createId(), nome: 'Esterco', qtd: '150', valorUnit: '0,32' },
    { id: createId(), nome: 'Farinha de ossos', qtd: '10', valorUnit: '1' },
    { id: createId(), nome: 'Torta de mamona', qtd: '100', valorUnit: '2' },
    { id: createId(), nome: 'Cinzas', qtd: '50', valorUnit: '1,20' },
    { id: createId(), nome: 'Pó de rocha', qtd: '100', valorUnit: '0,54' },
  ],
  resultado: null,
}

export function CustoCaldaPage() {
  const { showInterstitial } = useAds()
  const [form, setForm] = usePersistedState(STORAGE_KEYS.custoCalda, INITIAL)
  const [error, setError] = useState('')

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const campos = parseCustoCaldaCampos(form)
    if ('error' in campos) {
      setError(campos.error)
      setForm((current) => ({ ...current, resultado: null }))
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
        return
      }
      insumos.push({ id: item.id, nome, qtd, valorUnit })
    }

    if (insumos.length === 0) {
      setError('Lance pelo menos um insumo em kg.')
      setForm((current) => ({ ...current, resultado: null }))
      return
    }

    setError('')
    const resultado = calcularCustoCalda({ ...campos, insumos })
    setForm((current) => ({ ...current, resultado }))
    void showInterstitial('calculate')
  }

  const resultado = form.resultado
  const calda = readStore<CaldaFormState>(STORAGE_KEYS.calda)
  const tanqueCalda = calda?.tanqueLitros?.trim() || ''
  const lhaCalda = calda?.litrosPorHectare?.trim() || ''
  const podeCopiarTanque = Boolean(tanqueCalda || lhaCalda)

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

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      <PageSplit
        aside={
          resultado ? (
            <Card className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Resultado</h2>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Tanque" value={formatCurrency(resultado.totalValor)} />
                <Metric label="R$ / litro" value={formatCurrency(resultado.valorLitro)} />
                <Metric label="R$ / ha no ciclo" value={formatCurrency(resultado.valorOperacaoHa)} />
                <Metric
                  label="Volume no ciclo"
                  value={`${formatNumber(resultado.volumeCiclo, 0)} L/ha`}
                />
              </div>
              <GraficoPizza
                centro={formatCurrency(resultado.totalValor)}
                formatValor={formatCurrency}
                fatias={form.insumos
                  .map((item) => ({
                    label: item.nome.trim() || 'Insumo',
                    value: (parseDecimal(item.qtd) ?? 0) * (parseDecimal(item.valorUnit) ?? 0),
                    detalhe: `${formatNumber(parseDecimal(item.qtd) ?? 0)} kg`,
                  }))
                  .filter((fatia) => fatia.value > 0)}
              />
              {resultado.maiorCusto ? (
                <Row
                  label="Maior custo"
                  value={`${resultado.maiorCusto.nome} · ${formatNumber(resultado.maiorCusto.pct, 0)}%`}
                />
              ) : null}
              {resultado.maiorVolume ? (
                <Row
                  label="Maior volume"
                  value={`${resultado.maiorVolume.nome} · ${formatNumber(resultado.maiorVolume.qtd)} kg`}
                />
              ) : null}
            </Card>
          ) : null
        }
      >
      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Tanque e ciclo</h2>
        <p className="text-sm text-soil">
          Complementa a Calda: aqui o custo entra em kg e R$/kg, não em dose por litro.
          A receita abaixo é um exemplo — pode limpar e lançar a da fazenda.
        </p>
        {podeCopiarTanque ? (
          <Button type="button" variant="outline" full onClick={copiarTanqueDaCalda}>
            Usar tanque da Calda
            {tanqueCalda ? ` (${tanqueCalda} L` : ''}
            {lhaCalda ? `${tanqueCalda ? ', ' : ' ('}${lhaCalda} L/ha` : ''}
            {tanqueCalda || lhaCalda ? ')' : ''}
          </Button>
        ) : (
          <Link to="/calda" className="block text-sm font-semibold text-field">
            Abrir a Calda para informar o tanque
          </Link>
        )}
        <div className="grid gap-3 lg:grid-cols-3">
        <Input
          label="Volume do tanque (L)"
          name="tankVolume"
          inputMode="decimal"
          value={form.tankVolume}
          onChange={(event) => setForm({ ...form, tankVolume: event.target.value })}
        />
        <Input
          label="Litros por hectare"
          name="volPerHa"
          inputMode="decimal"
          value={form.volPerHa}
          onChange={(event) => setForm({ ...form, volPerHa: event.target.value })}
        />
        <Input
          label="Aplicações no ciclo"
          name="numApps"
          inputMode="numeric"
          value={form.numApps}
          onChange={(event) => setForm({ ...form, numApps: event.target.value })}
        />
        </div>
      </Card>

      {form.insumos.map((item, index) => (
        <Card key={item.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-soil">Insumo {index + 1}</p>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-leaf bg-cream"
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
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <Input
            label="Nome"
            name={`nome-${item.id}`}
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
              label="Quantidade (kg)"
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
              label="R$ / kg"
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
        Limpar receita de exemplo
      </Button>
      <Link to="/calda" className="block text-center text-sm font-semibold text-field">
        Voltar para a Calda
      </Link>

      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Button type="submit" full>
        Calcular
      </Button>
      </PageSplit>
    </form>
  )
}
