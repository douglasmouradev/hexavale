/** Custo de produtos por porte de planta. Depois do cálculo, lança na semana atual. */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { UsarCatalogo } from '@/components/caderno/UsarCatalogo'
import { STORAGE_KEYS } from '@/data/constants'
import { usePersistedState } from '@/hooks/usePersistedState'
import { lancarInsumosNoCiclo, mensagemLancamento } from '@/lib/caderno'
import {
  guardarProdutoInsumo,
  lerCatalogo,
  produtoInsumoPorId,
} from '@/lib/catalogo'
import { formatCurrency, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import { exportarInsumosPdf } from '@/lib/pdf'

interface ProdutoForm {
  id: string
  nome: string
  valor: string
  doseP: string
  doseM: string
  doseG: string
}

interface InsumosState {
  P: string
  M: string
  G: string
  produtos: ProdutoForm[]
  resultado: LinhaResultado[] | null
}

interface LinhaResultado {
  nome: string
  quantidade: number
  custo: number
}

const INITIAL: InsumosState = {
  P: '',
  M: '',
  G: '',
  produtos: [
    { id: createId(), nome: '', valor: '', doseP: '', doseM: '', doseG: '' },
  ],
  resultado: null,
}

export function InsumosPage() {
  const { propriedade, produtor } = useApp()
  const { showInterstitial } = useAds()
  const [form, setForm] = usePersistedState(STORAGE_KEYS.insumos, INITIAL)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [catalogoInsumos, setCatalogoInsumos] = useState(() => lerCatalogo().insumos)
  const linhas = form.resultado ?? null

  function emptyProduto(): ProdutoForm {
    return { id: createId(), nome: '', valor: '', doseP: '', doseM: '', doseG: '' }
  }

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const P = parseDecimal(form.P) ?? 0
    const M = parseDecimal(form.M) ?? 0
    const G = parseDecimal(form.G) ?? 0
    if (P + M + G <= 0) {
      setError('Informe a quantidade de plantas.')
      setForm((current) => ({ ...current, resultado: null }))
      return
    }

    const calculadas: LinhaResultado[] = []
    for (const produto of form.produtos) {
      const nome = produto.nome.trim()
      const valor = parseDecimal(produto.valor)
      if (!nome && valor === null) continue
      if (!nome || valor === null || valor < 0) {
        setError('Preencha nome e preço de cada produto lançado.')
        setForm((current) => ({ ...current, resultado: null }))
        return
      }
      const quantidade =
        P * (parseDecimal(produto.doseP) ?? 0) +
        M * (parseDecimal(produto.doseM) ?? 0) +
        G * (parseDecimal(produto.doseG) ?? 0)
      calculadas.push({ nome, quantidade, custo: quantidade * valor })
    }

    if (calculadas.length === 0) {
      setError('Lance pelo menos um produto.')
      return
    }

    setError('')
    setAviso('')
    setForm((current) => ({ ...current, resultado: calculadas }))
    for (const produto of form.produtos) {
      if (!produto.nome.trim()) continue
      guardarProdutoInsumo({
        nome: produto.nome,
        preco: produto.valor,
        doseP: produto.doseP,
        doseM: produto.doseM,
        doseG: produto.doseG,
      })
    }
    setCatalogoInsumos(lerCatalogo().insumos)
    void showInterstitial('calculate')
  }

  function handleDoCatalogo(id: string) {
    const produto = produtoInsumoPorId(id)
    if (!produto) return
    setForm((current) => {
      const jaTem = current.produtos.some(
        (item) => item.nome.trim().toLocaleLowerCase('pt-BR') === produto.nome.toLocaleLowerCase('pt-BR'),
      )
      if (jaTem) return current
      const vazio = current.produtos.find((item) => !item.nome.trim() && !item.valor.trim())
      const linha = {
        id: vazio?.id ?? createId(),
        nome: produto.nome,
        valor: produto.preco,
        doseP: produto.doseP,
        doseM: produto.doseM,
        doseG: produto.doseG,
      }
      if (vazio) {
        return {
          ...current,
          produtos: current.produtos.map((item) => (item.id === vazio.id ? linha : item)),
        }
      }
      return { ...current, produtos: [...current.produtos, linha] }
    })
  }

  function handleLancar() {
    if (!linhas?.length) return
    const result = lancarInsumosNoCiclo(produtor, linhas)
    setAviso(mensagemLancamento(result))
  }

  const total = linhas?.reduce((sum, item) => sum + item.custo, 0) ?? 0

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Plantas por porte</h2>
        <Input
          label="Mudas / pequenas"
          name="P"
          inputMode="numeric"
          value={form.P}
          onChange={(event) => setForm({ ...form, P: event.target.value })}
        />
        <Input
          label="Formação / médias"
          name="M"
          inputMode="numeric"
          value={form.M}
          onChange={(event) => setForm({ ...form, M: event.target.value })}
        />
        <Input
          label="Produção / grandes"
          name="G"
          inputMode="numeric"
          value={form.G}
          onChange={(event) => setForm({ ...form, G: event.target.value })}
        />
      </Card>

      <UsarCatalogo opcoes={catalogoInsumos} onEscolher={handleDoCatalogo} />

      {form.produtos.map((produto, index) => (
        <Card key={produto.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-soil">Produto {index + 1}</p>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream"
              onClick={() =>
                setForm({
                  ...form,
                  produtos:
                    form.produtos.length > 1
                      ? form.produtos.filter((item) => item.id !== produto.id)
                      : [emptyProduto()],
                })
              }
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <Input
            label="Nome"
            name={`nome-${produto.id}`}
            value={produto.nome}
            onChange={(event) =>
              setForm({
                ...form,
                produtos: form.produtos.map((item) =>
                  item.id === produto.id ? { ...item, nome: event.target.value } : item,
                ),
              })
            }
          />
          <Input
            label="Preço unitário (R$)"
            name={`valor-${produto.id}`}
            inputMode="decimal"
            value={produto.valor}
            onChange={(event) =>
              setForm({
                ...form,
                produtos: form.produtos.map((item) =>
                  item.id === produto.id ? { ...item, valor: event.target.value } : item,
                ),
              })
            }
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Dose P"
              name={`p-${produto.id}`}
              inputMode="decimal"
              value={produto.doseP}
              onChange={(event) =>
                setForm({
                  ...form,
                  produtos: form.produtos.map((item) =>
                    item.id === produto.id ? { ...item, doseP: event.target.value } : item,
                  ),
                })
              }
            />
            <Input
              label="Dose M"
              name={`m-${produto.id}`}
              inputMode="decimal"
              value={produto.doseM}
              onChange={(event) =>
                setForm({
                  ...form,
                  produtos: form.produtos.map((item) =>
                    item.id === produto.id ? { ...item, doseM: event.target.value } : item,
                  ),
                })
              }
            />
            <Input
              label="Dose G"
              name={`g-${produto.id}`}
              inputMode="decimal"
              value={produto.doseG}
              onChange={(event) =>
                setForm({
                  ...form,
                  produtos: form.produtos.map((item) =>
                    item.id === produto.id ? { ...item, doseG: event.target.value } : item,
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
        onClick={() => setForm({ ...form, produtos: [...form.produtos, emptyProduto()] })}
      >
        <Plus className="mr-2 h-5 w-5" />
        Adicionar produto
      </Button>
      <Link to="/catalogo" className="block text-center text-sm font-semibold text-field">
        Ver catálogo
      </Link>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}

      {linhas ? (
        <Card className="space-y-3">
          {linhas.map((linha) => (
            <div key={linha.nome} className="flex justify-between gap-3">
              <span className="font-bold text-ink">{linha.nome}</span>
              <span className="text-right text-field-dark">
                {formatNumberSafe(linha.quantidade)} · {formatCurrency(linha.custo)}
              </span>
            </div>
          ))}
          <p className="text-lg font-bold text-ink">Total {formatCurrency(total)}</p>
          {aviso ? (
            <p className="rounded-2xl bg-field/10 px-4 py-3 text-sm font-semibold text-field">
              {aviso}
            </p>
          ) : null}
          <Button type="button" full onClick={handleLancar}>
            Lançar na semana atual
          </Button>
          {aviso.startsWith('Lançado') ? (
            <Link to="/ciclo" className="block">
              <Button type="button" variant="outline" full>
                Ver no ciclo
              </Button>
            </Link>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            full
            onClick={() => exportarInsumosPdf(linhas, total, propriedade, produtor)}
          >
            Exportar PDF
          </Button>
        </Card>
      ) : null}

      <Button type="submit" full>
        Calcular
      </Button>
    </form>
  )
}

function formatNumberSafe(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
}
