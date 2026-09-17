import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { usePersistedState } from '@/hooks/usePersistedState'
import { formatCurrency, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'
import { exportarMaoDeObraPdf } from '@/lib/pdf'
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

export function MaoDeObraPage() {
  const { propriedade, produtor } = useApp()
  const { showInterstitial } = useAds()
  const [atividades, setAtividades] = usePersistedState<AtividadeForm[]>(
    STORAGE_KEYS.maoDeObra,
    [emptyAtividade()],
  )
  const [linhas, setLinhas] = useState<Linha[] | null>(null)
  const [error, setError] = useState('')
  const [calculating, setCalculating] = useState(false)

  function update(id: string, patch: Partial<AtividadeForm>) {
    setAtividades(atividades.map((item) => (item.id === id ? { ...item, ...patch } : item)))
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
    setCalculating(true)
    try {
      await showInterstitial('calculate')
      setLinhas(calculadas)
    } finally {
      setCalculating(false)
    }
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
                setAtividades(
                  atividades.length > 1
                    ? atividades.filter((item) => item.id !== atividade.id)
                    : [emptyAtividade()],
                )
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
        onClick={() => setAtividades([...atividades, emptyAtividade()])}
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

      <Button type="submit" full disabled={calculating}>
        {calculating ? 'Calculando...' : 'Calcular'}
      </Button>
    </form>
  )
}
