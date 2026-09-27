/**
 * Calcular safra: uma data de colheita e as quatro fases da mangueira.
 * Cada data da linha do tempo traz a ação daquela fase.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { scrollAoResultado } from '@/components/layout/StickyAction'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { useSessionState } from '@/hooks/useSessionState'
import {
  diasDoCiclo,
  diasNaoNegativos,
  marcosDaColheita,
  variedadePalmer,
  type VariedadeSafra,
} from '@/lib/calcularSafra'
import { formatBrUtc } from '@/lib/calendarioManga'
import { cn, parseDecimal } from '@/lib/format'
import { createId } from '@/lib/id'

interface SafraState {
  dataColheita: string
  variedades: VariedadeSafra[]
  selecionadaId: string
}

const INTERVALOS: { key: keyof Pick<VariedadeSafra, 'poda' | 'vegetativo' | 'inducao' | 'floracao'>; label: string; hint: string }[] = [
  {
    key: 'poda',
    label: 'Poda → nova estrutura (dias)',
    hint: 'Da poda até a planta formar ramos e folhas novos.',
  },
  {
    key: 'vegetativo',
    label: 'Desenvolvimento vegetativo (dias)',
    hint: 'Para os ramos madurecerem e ganharem reserva.',
  },
  {
    key: 'inducao',
    label: 'Indução floral (dias)',
    hint: 'A planta passa da folha para a flor.',
  },
  {
    key: 'floracao',
    label: 'Floração → colheita (dias)',
    hint: 'Da flor até a maturação e a colheita.',
  },
]

function estadoInicial(): SafraState {
  const palmer = variedadePalmer()
  return { dataColheita: '', variedades: [palmer], selecionadaId: palmer.id }
}

const INITIAL = estadoInicial()

function variedadeVazia(): VariedadeSafra {
  return { id: createId(), name: '', poda: 60, vegetativo: 90, inducao: 30, floracao: 140 }
}

export function CalcularSafraPage() {
  const { produtor, salvarProdutor } = useApp()
  const { showInterstitial } = useAds()
  const [form, setForm] = useSessionState(STORAGE_KEYS.calcularSafra, INITIAL)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<VariedadeSafra | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addDraft, setAddDraft] = useState<VariedadeSafra>(variedadeVazia)
  const [removeArmed, setRemoveArmed] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (form.dataColheita || !produtor.dataColheita) return
    setForm((current) =>
      current.dataColheita ? current : { ...current, dataColheita: produtor.dataColheita ?? '' },
    )
  }, [form.dataColheita, produtor.dataColheita, setForm])

  const variedade =
    form.variedades.find((item) => item.id === form.selecionadaId) ?? form.variedades[0]

  const marcos = useMemo(() => {
    if (!variedade || !form.dataColheita) return null
    return marcosDaColheita(variedade, form.dataColheita)
  }, [form.dataColheita, variedade])

  function gravarColheita(iso: string) {
    setForm({ ...form, dataColheita: iso })
    if (iso && iso !== produtor.dataColheita) {
      salvarProdutor({
        ...produtor,
        cultura: produtor.cultura ?? 'manga',
        dataColheita: iso,
      })
    }
  }

  function patchVariedade(next: VariedadeSafra) {
    setForm({
      ...form,
      variedades: form.variedades.map((item) => (item.id === next.id ? next : item)),
    })
  }

  function salvarEdicao() {
    if (!editDraft?.name.trim()) return
    patchVariedade({
      ...editDraft,
      name: editDraft.name.trim(),
      poda: diasNaoNegativos(editDraft.poda),
      vegetativo: diasNaoNegativos(editDraft.vegetativo),
      inducao: diasNaoNegativos(editDraft.inducao),
      floracao: diasNaoNegativos(editDraft.floracao),
    })
    setEditingId(null)
    setEditDraft(null)
  }

  function salvarNova() {
    if (!addDraft.name.trim()) return
    const criada: VariedadeSafra = {
      ...addDraft,
      id: createId(),
      name: addDraft.name.trim(),
      poda: diasNaoNegativos(addDraft.poda),
      vegetativo: diasNaoNegativos(addDraft.vegetativo),
      inducao: diasNaoNegativos(addDraft.inducao),
      floracao: diasNaoNegativos(addDraft.floracao),
    }
    setForm({
      ...form,
      variedades: [...form.variedades, criada],
      selecionadaId: criada.id,
    })
    setAddDraft(variedadeVazia())
    setShowAddForm(false)
  }

  function remover(id: string) {
    if (form.variedades.length <= 1) return
    if (removeArmed !== id) {
      setRemoveArmed(id)
      return
    }
    const resto = form.variedades.filter((item) => item.id !== id)
    setForm({
      ...form,
      variedades: resto,
      selecionadaId: form.selecionadaId === id ? resto[0]!.id : form.selecionadaId,
    })
    setRemoveArmed(null)
    if (editingId === id) {
      setEditingId(null)
      setEditDraft(null)
    }
  }

  if (!variedade) return null

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]">
      <Card className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-field">Variedades</h2>
          <p className="mt-1 text-sm text-soil">
            Os quatro intervalos mudam por variedade. A Palmer de exemplo usa 60, 90, 30 e 140 dias.
          </p>
        </div>

        {form.variedades.map((item) => {
          const editando = editingId === item.id && editDraft?.id === item.id
          if (editando && editDraft) {
            return (
              <div key={item.id} className="space-y-3 border-t border-line pt-3 first:border-0 first:pt-0">
                <Input
                  label="Nome da variedade"
                  name={`edit-nome-${item.id}`}
                  value={editDraft.name}
                  onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })}
                />
                <Intervalos
                  prefix={`edit-${item.id}`}
                  variedade={editDraft}
                  onChange={setEditDraft}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={salvarEdicao}>
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setEditDraft(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div key={item.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="shrink-0 text-xs text-soil">{diasDoCiclo(item)} dias no ciclo</p>
              </div>
              <p className="mt-1 text-xs leading-snug text-soil">
                Poda {item.poda} · Vegetativo {item.vegetativo} · Indução {item.inducao} · Floração{' '}
                {item.floracao}
              </p>
              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  className="text-[12.5px] text-soil underline underline-offset-2"
                  onClick={() => {
                    setForm({ ...form, selecionadaId: item.id })
                    setShowAddForm(false)
                    setEditingId(item.id)
                    setEditDraft({ ...item })
                  }}
                >
                  Editar
                </button>
                {form.variedades.length > 1 ? (
                  <button
                    type="button"
                    className="text-[12.5px] text-soil underline underline-offset-2 hover:text-danger"
                    onClick={() => remover(item.id)}
                  >
                    {removeArmed === item.id ? 'Confirmar remoção' : 'Remover'}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}

        <button
          type="button"
          className="w-full rounded-leaf border border-dashed border-line px-3 py-2.5 text-left text-sm text-soil"
          onClick={() => {
            const opening = !showAddForm
            setShowAddForm(opening)
            setEditingId(null)
            setEditDraft(null)
            if (opening) setAddDraft(variedadeVazia())
          }}
        >
          + Cadastrar nova variedade
        </button>

        {showAddForm ? (
          <div className="space-y-3 border-t border-dashed border-line pt-3">
            <Input
              label="Nome da variedade"
              name="newName"
              placeholder="Ex: Tommy Atkins"
              value={addDraft.name}
              onChange={(event) => setAddDraft({ ...addDraft, name: event.target.value })}
            />
            <Intervalos prefix="new" variedade={addDraft} onChange={setAddDraft} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={salvarNova}>
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-field">Calculadora</h2>
          <p className="mt-1 text-sm text-soil">
            Tudo parte da data desejada da colheita. O calendário conta os dias para trás e mostra,
            em cada data, a ação do ciclo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Select
            label="Variedade"
            name="varietySelect"
            value={form.selecionadaId}
            onChange={(event) => setForm({ ...form, selecionadaId: event.target.value })}
          >
            {form.variedades.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <DateField
            label="Data desejada da colheita"
            name="harvestDate"
            value={form.dataColheita}
            onChange={gravarColheita}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              scrollAoResultado(resultRef.current)
              if (form.dataColheita) void showInterstitial('calculate')
            }}
          >
            Calcular
          </Button>
        </div>

        <div ref={resultRef}>
          {marcos ? (
            <>
              <div className="relative mt-2 space-y-4 border-l border-line pl-6">
                {marcos.map((marco) => (
                  <div key={marco.nome} className="relative">
                    <span
                      className={cn(
                        'absolute -left-6 top-1.5 h-2.5 w-2.5 -translate-x-[5px] rounded-full border-2 bg-paper',
                        marco.alvo ? 'border-mango bg-mango' : 'border-soil',
                      )}
                    />
                    <p className="text-sm font-semibold text-ink">{marco.nome}</p>
                    <p
                      className={cn(
                        'font-display text-xl font-semibold',
                        marco.alvo ? 'text-mango' : 'text-field',
                      )}
                    >
                      {formatBrUtc(marco.data)}
                    </p>
                    {marco.dias !== null ? (
                      <p className="text-xs text-soil">{marco.dias} dias após a etapa anterior</p>
                    ) : null}
                    <p className="mt-1 text-sm leading-snug text-ink">{marco.acao}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-soil">
                Ciclo total: {diasDoCiclo(variedade)} dias, da poda até a colheita.
              </p>
            </>
          ) : (
            <Banner>Escolha a data desejada da colheita para ver as datas e as ações.</Banner>
          )}
        </div>

        <Link to="/calendario" className="block text-center text-sm font-semibold text-field">
          Planejar os tratos desta safra
        </Link>
      </Card>
    </div>
  )
}

function Intervalos({
  prefix,
  variedade,
  onChange,
}: {
  prefix: string
  variedade: VariedadeSafra
  onChange: (next: VariedadeSafra) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {INTERVALOS.map((intervalo) => (
        <Input
          key={intervalo.key}
          label={intervalo.label}
          hint={intervalo.hint}
          name={`${prefix}-${intervalo.key}`}
          inputMode="numeric"
          value={String(variedade[intervalo.key])}
          onChange={(event) =>
            onChange({
              ...variedade,
              [intervalo.key]: diasNaoNegativos(parseDecimal(event.target.value) ?? 0),
            })
          }
        />
      ))}
    </div>
  )
}
