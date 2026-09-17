/** Regulador de crescimento: dose em mL/planta por porte, volume em L e custo. */
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageSplit } from '@/components/layout/PageSplit'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Input } from '@/components/ui/Input'
import { Metric } from '@/components/ui/Metric'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { usePersistedState } from '@/hooks/usePersistedState'
import { formatCurrency, formatNumber, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import { calcularRegulador, parsePlantas } from '@/lib/regulador'

interface InsumoForm {
  id: string
  nome: string
  dosMaior: string
  dosMedia: string
  dosMenor: string
  valorUnit: string
}

interface ReguladorResultado {
  totalPlantas: number
  volumeTotal: number
  custoTotal: number
  custoHa: number
  itens: { id: string; nome: string; volume: number; custo: number }[]
}

interface ReguladorState {
  areaHa: string
  plantasMaior: string
  plantasMedia: string
  plantasMenor: string
  insumos: InsumoForm[]
  resultado: ReguladorResultado | null
}

function emptyInsumo(): InsumoForm {
  return {
    id: createId(),
    nome: '',
    dosMaior: '',
    dosMedia: '',
    dosMenor: '',
    valorUnit: '',
  }
}

const INITIAL: ReguladorState = {
  areaHa: '',
  plantasMaior: '',
  plantasMedia: '',
  plantasMenor: '',
  insumos: [
    {
      id: createId(),
      nome: 'Paclo BR',
      dosMaior: '30',
      dosMedia: '25',
      dosMenor: '20',
      valorUnit: '48',
    },
    {
      id: createId(),
      nome: 'Ácido fúlvico',
      dosMaior: '20',
      dosMedia: '20',
      dosMenor: '20',
      valorUnit: '9,90',
    },
  ],
  resultado: null,
}

export function ReguladorPage() {
  const { produtor } = useApp()
  const { showInterstitial } = useAds()
  const [form, setForm] = usePersistedState(STORAGE_KEYS.regulador, INITIAL)
  const [error, setError] = useState('')

  useEffect(() => {
    if (form.areaHa || !produtor.areaHectares) return
    setForm((current) =>
      current.areaHa ? current : { ...current, areaHa: produtor.areaHectares ?? '' },
    )
  }, [form.areaHa, produtor.areaHectares, setForm])

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const areaHa = parseDecimal(form.areaHa) ?? 0
    const plantasMaior = parsePlantas(form.plantasMaior)
    const plantasMedia = parsePlantas(form.plantasMedia)
    const plantasMenor = parsePlantas(form.plantasMenor)
    if (plantasMaior + plantasMedia + plantasMenor <= 0) {
      setError('Informe a quantidade de plantas.')
      setForm((current) => ({ ...current, resultado: null }))
      return
    }

    const insumos = []
    for (const item of form.insumos) {
      const nome = item.nome.trim()
      if (!nome && !item.valorUnit.trim()) continue
      if (!nome) {
        setError('Informe o nome de cada produto lançado.')
        setForm((current) => ({ ...current, resultado: null }))
        return
      }
      insumos.push({
        id: item.id,
        nome,
        dosMaior: parseDecimal(item.dosMaior) ?? 0,
        dosMedia: parseDecimal(item.dosMedia) ?? 0,
        dosMenor: parseDecimal(item.dosMenor) ?? 0,
        valorUnit: parseDecimal(item.valorUnit) ?? 0,
      })
    }

    if (insumos.length === 0) {
      setError('Lance pelo menos um regulador.')
      setForm((current) => ({ ...current, resultado: null }))
      return
    }

    setError('')
    const resultado = calcularRegulador({
      areaHa,
      plantasMaior,
      plantasMedia,
      plantasMenor,
      insumos,
    })
    setForm((current) => ({ ...current, resultado }))
    void showInterstitial('calculate')
  }

  const resultado = form.resultado

  if (produtor.cultura === 'uva') {
    return (
      <Card className="space-y-3">
        <p className="font-bold text-ink">Ferramenta da mangueira</p>
        <p className="text-sm text-soil">
          O regulador em mL por planta é o da manga. Na uva, use Insumos por porte.
        </p>
        <Link to="/insumos" className="block">
          <Button full>Abrir insumos</Button>
        </Link>
      </Card>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      <PageSplit
        aside={
          resultado ? (
            <Card className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Resultado</h2>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Plantas" value={formatNumber(resultado.totalPlantas, 0)} />
                <Metric label="Volume" value={`${formatNumber(resultado.volumeTotal, 2)} L`} />
                <Metric label="Custo total" value={formatCurrency(resultado.custoTotal)} />
                <Metric label="Custo / ha" value={formatCurrency(resultado.custoHa)} />
              </div>
              <GraficoPizza
                centro={formatCurrency(resultado.custoTotal)}
                formatValor={formatCurrency}
                fatias={resultado.itens.map((item) => ({
                  label: item.nome,
                  value: item.custo,
                  detalhe: `${formatNumber(item.volume, 2)} L`,
                }))}
              />
              {resultado.itens.map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <span className="font-medium text-ink">{item.nome}</span>
                  <span className="text-right text-field-dark">
                    {formatNumber(item.volume, 2)} L · {formatCurrency(item.custo)}
                  </span>
                </div>
              ))}
            </Card>
          ) : null
        }
      >
      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Talhão</h2>
        <p className="text-sm text-soil">
          Dose em mL por planta. O volume sai em litros: (mL × plantas) / 1000.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
        <Input
          label="Área (ha)"
          name="areaHa"
          inputMode="decimal"
          value={form.areaHa}
          onChange={(event) => setForm({ ...form, areaHa: event.target.value })}
        />
        <Input
          label="Plantas maiores"
          name="plantasMaior"
          inputMode="numeric"
          value={form.plantasMaior}
          onChange={(event) => setForm({ ...form, plantasMaior: event.target.value })}
        />
        <Input
          label="Plantas médias"
          name="plantasMedia"
          inputMode="numeric"
          value={form.plantasMedia}
          onChange={(event) => setForm({ ...form, plantasMedia: event.target.value })}
        />
        <Input
          label="Plantas menores"
          name="plantasMenor"
          inputMode="numeric"
          value={form.plantasMenor}
          onChange={(event) => setForm({ ...form, plantasMenor: event.target.value })}
        />
        </div>
      </Card>

      {form.insumos.map((item, index) => (
        <Card key={item.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-soil">Produto {index + 1}</p>
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
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="mL maior"
              name={`maior-${item.id}`}
              inputMode="decimal"
              value={item.dosMaior}
              onChange={(event) =>
                setForm({
                  ...form,
                  insumos: form.insumos.map((linha) =>
                    linha.id === item.id ? { ...linha, dosMaior: event.target.value } : linha,
                  ),
                })
              }
            />
            <Input
              label="mL média"
              name={`media-${item.id}`}
              inputMode="decimal"
              value={item.dosMedia}
              onChange={(event) =>
                setForm({
                  ...form,
                  insumos: form.insumos.map((linha) =>
                    linha.id === item.id ? { ...linha, dosMedia: event.target.value } : linha,
                  ),
                })
              }
            />
            <Input
              label="mL menor"
              name={`menor-${item.id}`}
              inputMode="decimal"
              value={item.dosMenor}
              onChange={(event) =>
                setForm({
                  ...form,
                  insumos: form.insumos.map((linha) =>
                    linha.id === item.id ? { ...linha, dosMenor: event.target.value } : linha,
                  ),
                })
              }
            />
          </div>
          <Input
            label="R$ / litro"
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
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        full
        onClick={() => setForm({ ...form, insumos: [...form.insumos, emptyInsumo()] })}
      >
        <Plus className="mr-2 h-5 w-5" />
        Adicionar produto
      </Button>

      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Button type="submit" full>
        Calcular
      </Button>
      </PageSplit>
    </form>
  )
}
