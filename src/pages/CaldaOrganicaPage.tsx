/** Calda orgânica: tanque, área (pré-preenchida do Produtor) e receita. */
import { useEffect, useRef, useState, lazy, Suspense, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { UsarCatalogo } from '@/components/caderno/UsarCatalogo'
import { PageSplit } from '@/components/layout/PageSplit'
import { StickyAction, scrollAoResultado } from '@/components/layout/StickyAction'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { useCaldaForm } from '@/hooks/useCaldaForm'
import { calcularCalda, parseCaldaCampos, UNIDADES_DOSE, type ResultadoCalda } from '@/lib/calda'
import {
  guardarProdutoCalda,
  lerCatalogo,
  produtoCaldaPorId,
} from '@/lib/catalogo'
import { parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import type { Insumo, UnidadeDose } from '@/types/models'

const CaldaResultado = lazy(async () => {
  const module = await import('@/components/calda/CaldaResultado')
  return { default: module.CaldaResultado }
})

export function CaldaOrganicaPage() {
  const { propriedade, produtor } = useApp()
  const { showInterstitial } = useAds()
  const { form, setForm, addInsumo, removeInsumo, updateInsumo } = useCaldaForm()
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<ResultadoCalda | null>(form.resultado)
  const [catalogoCalda, setCatalogoCalda] = useState(() => lerCatalogo().calda)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Só preenche se o campo da calda estiver vazio — o produtor pode usar outra área.
    if (form.areaHectares || !produtor.areaHectares) return
    setForm((current) =>
      current.areaHectares ? current : { ...current, areaHectares: produtor.areaHectares ?? '' },
    )
  }, [form.areaHectares, produtor.areaHectares, setForm])

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const campos = parseCaldaCampos(form)
    if ('error' in campos) {
      setError(campos.error)
      return
    }

    const insumos: Insumo[] = []
    for (const item of form.insumos) {
      const nome = item.nome.trim()
      const dose = parseDecimal(item.dose)
      if (!nome && (dose === null || dose === 0)) continue
      if (!nome) {
        setError('Informe o nome de cada insumo lançado.')
        return
      }
      if (dose === null || dose <= 0) {
        setError(`Informe a dose de ${nome}.`)
        return
      }
      insumos.push({
        id: item.id || createId(),
        nome,
        dose,
        unidade: item.unidade,
      })
    }

    if (insumos.length === 0) {
      setError('Lance pelo menos um insumo da calda.')
      return
    }

    setError('')
    const next = calcularCalda({ ...campos, insumos, tanqueParcial: form.tanqueParcial })
    setResultado(next)
    setForm((current) => ({ ...current, resultado: next }))
    for (const item of form.insumos) {
      if (!item.nome.trim()) continue
      guardarProdutoCalda({
        nome: item.nome,
        dose: item.dose,
        unidade: item.unidade,
      })
    }
    setCatalogoCalda(lerCatalogo().calda)
    scrollAoResultado(resultRef.current)
    void showInterstitial('calculate')
  }

  function handleDoCatalogo(id: string) {
    const produto = produtoCaldaPorId(id)
    if (!produto) return
    setForm((current) => {
      const jaTem = current.insumos.some(
        (item) =>
          item.nome.trim().toLocaleLowerCase('pt-BR') ===
          produto.nome.toLocaleLowerCase('pt-BR'),
      )
      if (jaTem) return current
      const vazio = current.insumos.find((item) => !item.nome.trim() && !item.dose.trim())
      const linha = {
        id: vazio?.id ?? createId(),
        nome: produto.nome,
        dose: produto.dose,
        unidade: produto.unidade,
      }
      if (vazio) {
        return {
          ...current,
          insumos: current.insumos.map((item) => (item.id === vazio.id ? linha : item)),
        }
      }
      return { ...current, insumos: [...current.insumos, linha] }
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      <PageSplit
        aside={
          resultado ? (
            <div ref={resultRef}>
              <Suspense fallback={<p className="text-sm text-soil">Carregando resultado...</p>}>
                <CaldaResultado
                  resultado={resultado}
                  onExportPdf={async () => {
                    const { exportarCaldaPdf } = await import('@/lib/exportarPdf')
                    await exportarCaldaPdf(resultado, propriedade, produtor)
                  }}
                />
              </Suspense>
            </div>
          ) : null
        }
      >
        <Card className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Tanque e área</h2>
          <p className="text-sm leading-snug text-soil">
            Dose por litro (ml/L, g/L). O valor em kg e R$ fica em Custo da calda.
          </p>
          <label className="flex items-center gap-3 border border-line bg-cream/50 px-3 py-3">
            <input
              type="checkbox"
              className="h-5 w-5 accent-field"
              checked={form.tanqueParcial}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tanqueParcial: event.target.checked,
                }))
              }
            />
            <span className="text-sm font-semibold text-ink">
              Último tanque parcial (só o volume da área)
            </span>
          </label>
          <div className="grid gap-3 lg:grid-cols-3">
            <Input
              label="Tanque (L)"
              name="tanque"
              inputMode="decimal"
              placeholder="2000"
              value={form.tanqueLitros}
              onChange={(event) =>
                setForm((current) => ({ ...current, tanqueLitros: event.target.value }))
              }
            />
            <Input
              label="Área (ha)"
              name="area"
              inputMode="decimal"
              placeholder={produtor.areaHectares || '10'}
              hint={
                produtor.areaHectares && form.areaHectares === produtor.areaHectares
                  ? 'Veio de Produtor. Pode alterar se esta calda for em outra área.'
                  : undefined
              }
              value={form.areaHectares}
              onChange={(event) =>
                setForm((current) => ({ ...current, areaHectares: event.target.value }))
              }
            />
            <Input
              label="L/ha"
              name="litrosPorHectare"
              inputMode="decimal"
              placeholder="400"
              value={form.litrosPorHectare}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  litrosPorHectare: event.target.value,
                }))
              }
            />
          </div>
          <Link to="/custo-calda" className="block text-sm font-semibold leading-snug text-field">
            Custo em kg e R$ (valor do litro e da operação no ciclo)
          </Link>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Insumos da calda</h2>
          <UsarCatalogo opcoes={catalogoCalda} onEscolher={handleDoCatalogo} />

          {form.insumos.map((insumo, index) => (
            <div
              key={insumo.id}
              className="space-y-3 border border-line bg-cream/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-soil">Insumo {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeInsumo(insumo.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-leaf bg-paper text-soil"
                  aria-label={`Remover ${insumo.nome || `insumo ${index + 1}`}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <Input
                label="Nome do insumo"
                name={`insumo-nome-${insumo.id}`}
                placeholder="Calda bordalesa"
                value={insumo.nome}
                onChange={(event) =>
                  updateInsumo(insumo.id, { nome: event.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Dose"
                  name={`insumo-dose-${insumo.id}`}
                  inputMode="decimal"
                  placeholder="Ex: 10"
                  value={insumo.dose}
                  onChange={(event) =>
                    updateInsumo(insumo.id, { dose: event.target.value })
                  }
                />
                <Select
                  label="Unidade"
                  name={`insumo-unidade-${insumo.id}`}
                  value={insumo.unidade}
                  onChange={(event) =>
                    updateInsumo(insumo.id, {
                      unidade: event.target.value as UnidadeDose,
                    })
                  }
                >
                  {UNIDADES_DOSE.map((unidade) => (
                    <option key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-sm font-medium text-ink">
                {
                  UNIDADES_DOSE.find((item) => item.value === insumo.unidade)
                    ?.hint
                }
              </p>
            </div>
          ))}

          <Button type="button" variant="outline" full onClick={addInsumo}>
            <Plus className="mr-2 h-5 w-5" />
            Adicionar insumo
          </Button>
          <Link to="/catalogo" className="block text-center text-sm font-semibold text-field">
            Ver catálogo
          </Link>
          <Link to="/custo-calda" className="block text-center text-sm font-semibold text-field">
            Custo da calda (kg e R$)
          </Link>
        </Card>

        {error ? <Banner tone="danger">{error}</Banner> : null}

        <StickyAction>
          <Button type="submit" full>
            Calcular
          </Button>
        </StickyAction>
      </PageSplit>
    </form>
  )
}
