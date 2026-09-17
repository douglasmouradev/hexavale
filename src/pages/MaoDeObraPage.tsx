/** Diária e serviços. O total lança na semana atual do ciclo. */
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { lancarMaoDeObraNoCiclo, mensagemLancamento } from '@/lib/caderno'
import { formatCurrency, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import { exportarMaoDeObraPdf } from '@/lib/pdf'
import { readStore, writeStore } from '@/storage/localStore'
import type { UnidadeTempo } from '@/types/models'

interface AtividadeForm {
  id: string
  nome: string
  trabalhadores: string
  valor: string
  tempo: string
  unidade: UnidadeTempo
}

interface Linha {
  nome: string
  custo: number
}

interface MaoDeObraState {
  atividades: AtividadeForm[]
  resultado: Linha[] | null
}

const SUGESTOES = ['Poda', 'Pulverização', 'Capina', 'Colheita', 'Irrigação', 'Adubação']

function emptyAtividade(): AtividadeForm {
  return {
    id: createId(),
    nome: '',
    trabalhadores: '',
    valor: '',
    tempo: '',
    unidade: 'dias',
  }
}

function loadMaoDeObra(): MaoDeObraState {
  const raw = readStore<MaoDeObraState | AtividadeForm[]>(STORAGE_KEYS.maoDeObra)
  if (Array.isArray(raw) && raw.length) {
    return { atividades: raw, resultado: null }
  }
  if (raw && !Array.isArray(raw) && Array.isArray(raw.atividades) && raw.atividades.length) {
    return { atividades: raw.atividades, resultado: raw.resultado ?? null }
  }
  return { atividades: [emptyAtividade()], resultado: null }
}

export function MaoDeObraPage() {
  const { propriedade, produtor } = useApp()
  const { showInterstitial } = useAds()
  const [form, setForm] = useState<MaoDeObraState>(loadMaoDeObra)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    writeStore(STORAGE_KEYS.maoDeObra, form)
  }, [form])

  const atividades = form.atividades
  const linhas = form.resultado

  function update(id: string, patch: Partial<AtividadeForm>) {
    setForm((current) => ({
      ...current,
      atividades: current.atividades.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }))
  }

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const calculadas: Linha[] = []
    for (const atividade of atividades) {
      const nome = atividade.nome.trim()
      const trabalhadores = parseDecimal(atividade.trabalhadores)
      const valor = parseDecimal(atividade.valor)
      const tempo = parseDecimal(atividade.tempo)
      if (!nome && !trabalhadores && !valor && !tempo) continue
      if (!nome || !trabalhadores || !valor || !tempo) {
        setError('Complete nome, gente, valor e tempo de cada atividade.')
        return
      }
      calculadas.push({
        nome,
        custo: trabalhadores * valor * tempo,
      })
    }
    if (calculadas.length === 0) {
      setError('Lance pelo menos uma atividade.')
      return
    }
    setError('')
    setAviso('')
    setForm((current) => ({ ...current, resultado: calculadas }))
    void showInterstitial('calculate')
  }

  function handleLancar() {
    if (!linhas?.length) return
    const result = lancarMaoDeObraNoCiclo(produtor, linhas)
    setAviso(mensagemLancamento(result))
  }

  const total = linhas?.reduce((sum, item) => sum + item.custo, 0) ?? 0

  return (
    <form className="space-y-5" onSubmit={handleCalculate}>
      {atividades.map((atividade, index) => (
        <Card key={atividade.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-soil">Serviço {index + 1}</p>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  atividades:
                    current.atividades.length > 1
                      ? current.atividades.filter((item) => item.id !== atividade.id)
                      : [emptyAtividade()],
                }))
              }
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <Input
            label="Atividade"
            name={`nome-${atividade.id}`}
            placeholder={SUGESTOES[index % SUGESTOES.length]}
            value={atividade.nome}
            onChange={(event) => update(atividade.id, { nome: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pessoas"
              name={`pessoas-${atividade.id}`}
              inputMode="numeric"
              value={atividade.trabalhadores}
              onChange={(event) => update(atividade.id, { trabalhadores: event.target.value })}
            />
            <Input
              label={atividade.unidade === 'horas' ? 'R$ / hora' : 'Diária (R$)'}
              name={`valor-${atividade.id}`}
              inputMode="decimal"
              value={atividade.valor}
              onChange={(event) => update(atividade.id, { valor: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempo"
              name={`tempo-${atividade.id}`}
              inputMode="decimal"
              value={atividade.tempo}
              onChange={(event) => update(atividade.id, { tempo: event.target.value })}
            />
            <Select
              label="Unidade"
              name={`unidade-${atividade.id}`}
              value={atividade.unidade}
              onChange={(event) =>
                update(atividade.id, { unidade: event.target.value as UnidadeTempo })
              }
            >
              <option value="dias">Dias</option>
              <option value="horas">Horas</option>
            </Select>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        full
        onClick={() =>
          setForm((current) => ({
            ...current,
            atividades: [...current.atividades, emptyAtividade()],
          }))
        }
      >
        <Plus className="mr-2 h-5 w-5" />
        Adicionar serviço
      </Button>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}

      {linhas ? (
        <Card className="space-y-3">
          {linhas.map((linha) => (
            <div key={linha.nome} className="flex justify-between">
              <span className="font-bold text-ink">{linha.nome}</span>
              <span>{formatCurrency(linha.custo)}</span>
            </div>
          ))}
          <p className="text-lg font-bold">Total {formatCurrency(total)}</p>
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
            onClick={() => exportarMaoDeObraPdf(linhas, total, propriedade, produtor)}
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
