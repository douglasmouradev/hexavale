/**
 * Calendário e custos da mangueira: variedades à esquerda,
 * timeline e 3 cartões de operação por semana à direita.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { scrollAoResultado } from '@/components/layout/StickyAction'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DateField } from '@/components/ui/DateField'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Input } from '@/components/ui/Input'
import { Metric } from '@/components/ui/Metric'
import { Select } from '@/components/ui/Select'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { usePersistedState } from '@/hooks/usePersistedState'
import { contarPlantasInsumos } from '@/lib/caderno'
import {
  addDaysUtc,
  aplicarEdicaoVariedade,
  custosDoCiclo,
  custoDaOperacao,
  datasDasEtapas,
  diasTotais,
  formatBrUtc,
  isoAnoSemanaUtc,
  laborCalc,
  machineCalc,
  montarNovaVariedade,
  palmerPadrao,
  rascunhoDasEtapas,
  rascunhoNovo,
  sincronizarTalhao,
  talhaoDoProdutor,
  type EtapaRascunho,
  type LaborOp,
  type MachineOp,
  type OperacaoSemana,
  type TalhaoCalendario,
  type VariedadeManga,
} from '@/lib/calendarioManga'
import { createId } from '@/lib/id'
import { formatCurrency, formatNumber, parseDecimal, cn } from '@/lib/format'
import { exportarCalendarioPdf } from '@/lib/exportarPdf'

interface CalendarioState {
  dataAlvo: string
  variedades: VariedadeManga[]
  selecionadaId: string
}

function estadoInicial(): CalendarioState {
  const palmer = palmerPadrao()
  return { dataAlvo: '', variedades: [palmer], selecionadaId: palmer.id }
}

const INITIAL = estadoInicial()

const SUGESTOES_OP = [
  'Poda pós-colheita',
  'Roçagem mecanizada',
  'Cont. de ervas daninhas – herbicida',
  'Pulv. meca. (turbo atomizador)',
  'Retirada de malfor. florais',
  'Aplicação manual de reg. de cresc.',
  'Escoramento',
  'Batedura de panícula',
  'Pincelamento de frutos',
  'Pré-toalete do fruto',
  'Toalete do fruto',
  'Colheita',
  'Limpeza',
]

export function CalendarioPage() {
  const { propriedade, produtor, salvarProdutor } = useApp()
  const [form, setForm] = usePersistedState(STORAGE_KEYS.calendario, INITIAL)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addDraft, setAddDraft] = useState<AddDraft>(() => rascunhoCadastro())
  const [removeArmed, setRemoveArmed] = useState<string | null>(null)
  const [planosAbertos, setPlanosAbertos] = useState<Record<string, boolean>>({})
  const [calcAberto, setCalcAberto] = useState<Record<string, { labor?: boolean; machine?: boolean }>>(
    {},
  )
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (form.dataAlvo || !produtor.dataColheita) return
    setForm((current) =>
      current.dataAlvo ? current : { ...current, dataAlvo: produtor.dataColheita ?? '' },
    )
  }, [form.dataAlvo, produtor.dataColheita, setForm])

  const variedade =
    form.variedades.find((item) => item.id === form.selecionadaId) ?? form.variedades[0]

  const datas = useMemo(() => {
    if (!variedade || !form.dataAlvo) return null
    return datasDasEtapas(variedade, form.dataAlvo)
  }, [form.dataAlvo, variedade])

  const custos = useMemo(() => (variedade ? custosDoCiclo(variedade) : null), [variedade])

  function patchVariedade(next: VariedadeManga) {
    setForm((current) => ({
      ...current,
      variedades: current.variedades.map((item) => (item.id === next.id ? next : item)),
    }))
  }

  function patchOp(etapaId: string, weekId: string, opIndex: number, next: OperacaoSemana) {
    if (!variedade) return
    patchVariedade({
      ...variedade,
      stages: variedade.stages.map((etapa) => {
        if (etapa.id !== etapaId) return etapa
        return {
          ...etapa,
          weeks: (etapa.weeks ?? []).map((week) =>
            week.id !== weekId
              ? week
              : {
                  ...week,
                  ops: week.ops.map((op, index) => (index === opIndex ? next : op)) as typeof week.ops,
                },
          ),
        }
      }),
    })
  }

  function gravarColheita(iso: string) {
    setForm({ ...form, dataAlvo: iso })
    if (iso && iso !== produtor.dataColheita) {
      salvarProdutor({
        ...produtor,
        cultura: produtor.cultura ?? 'manga',
        dataColheita: iso,
      })
    }
  }

  function handleCalcular() {
    scrollAoResultado(resultRef.current)
  }

  function abrirEdicao(item: VariedadeManga) {
    setShowAddForm(false)
    setEditingId(item.id)
    setEditDraft({
      id: item.id,
      name: item.name,
      talhao: { ...item.talhao },
      stages: rascunhoDasEtapas(item.stages),
    })
  }

  function salvarEdicao() {
    if (!editDraft || !variedade) return
    const atual = form.variedades.find((item) => item.id === editDraft.id)
    if (!atual || !editDraft.name.trim()) return
    patchVariedade(aplicarEdicaoVariedade(atual, editDraft.name, editDraft.talhao, editDraft.stages))
    setEditingId(null)
    setEditDraft(null)
  }

  function handleNovaVariedade() {
    if (!addDraft.name.trim()) return
    const criada = montarNovaVariedade(
      addDraft.name,
      {
        nome: addDraft.talhaoNome,
        nPlantas: parseDecimal(addDraft.nPlantas) ?? 0,
        areaHa: parseDecimal(addDraft.areaHa) ?? 0,
        valorDiaria: parseDecimal(addDraft.valorDiaria) ?? 0,
        jornadaHoras: parseDecimal(addDraft.jornadaHoras) ?? 0,
      },
      addDraft.stages,
    )
    setForm((current) => ({
      ...current,
      variedades: [...current.variedades, criada],
      selecionadaId: criada.id,
    }))
    setShowAddForm(false)
    setAddDraft(rascunhoCadastro())
  }

  function handleRemoverVariedade(id: string) {
    if (form.variedades.length <= 1) return
    if (removeArmed !== id) {
      setRemoveArmed(id)
      window.setTimeout(() => {
        setRemoveArmed((atual) => (atual === id ? null : atual))
      }, 3000)
      return
    }
    setForm((current) => {
      const resto = current.variedades.filter((item) => item.id !== id)
      return { ...current, variedades: resto, selecionadaId: resto[0]!.id }
    })
    if (editingId === id) {
      setEditingId(null)
      setEditDraft(null)
    }
    setRemoveArmed(null)
  }

  function handleRestaurarPalmer() {
    const palmer = palmerPadrao()
    const next = sincronizarTalhao(palmer, talhaoDoProdutor(produtor, palmer.talhao, contarPlantasInsumos()))
    setForm({ dataAlvo: form.dataAlvo, variedades: [next], selecionadaId: next.id })
    setEditingId(null)
    setEditDraft(null)
    setPlanosAbertos({})
  }

  function handleUsarProdutorNoDraft() {
    if (!editDraft) return
    setEditDraft({
      ...editDraft,
      talhao: talhaoDoProdutor(produtor, editDraft.talhao, contarPlantasInsumos()),
    })
  }

  if (!variedade) return null

  const ultimaEtapa = variedade.stages[variedade.stages.length - 1]
  const podeUsarProdutor = Boolean(
    produtor.areaHectares?.trim() || produtor.talhoes?.trim() || contarPlantasInsumos(),
  )

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]">
      <Card className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-field">Variedades e talhão</h2>
          <p className="mt-1 text-sm text-soil">
            Edite o ciclo e o talhão. A calculadora usa a variedade selecionada.
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
                <p className="text-xs font-semibold text-ink">Talhão</p>
                <Input
                  label="Nome do talhão"
                  name={`edit-talhao-${item.id}`}
                  value={editDraft.talhao.nome}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      talhao: { ...editDraft.talhao, nome: event.target.value },
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Nº de plantas"
                    name={`edit-plantas-${item.id}`}
                    inputMode="numeric"
                    value={numField(editDraft.talhao.nPlantas)}
                    onChange={(event) =>
                      patchDraftTalhao(editDraft, setEditDraft, {
                        nPlantas: parseDecimal(event.target.value) ?? 0,
                      })
                    }
                  />
                  <Input
                    label="Área (ha)"
                    name={`edit-area-${item.id}`}
                    inputMode="decimal"
                    value={numField(editDraft.talhao.areaHa)}
                    onChange={(event) =>
                      patchDraftTalhao(editDraft, setEditDraft, {
                        areaHa: parseDecimal(event.target.value) ?? 0,
                      })
                    }
                  />
                  <Input
                    label="Valor da diária (R$)"
                    name={`edit-diaria-${item.id}`}
                    inputMode="decimal"
                    value={numField(editDraft.talhao.valorDiaria)}
                    onChange={(event) =>
                      patchDraftTalhao(editDraft, setEditDraft, {
                        valorDiaria: parseDecimal(event.target.value) ?? 0,
                      })
                    }
                  />
                  <Input
                    label="Jornada (h/dia)"
                    name={`edit-jornada-${item.id}`}
                    inputMode="decimal"
                    value={numField(editDraft.talhao.jornadaHoras)}
                    onChange={(event) =>
                      patchDraftTalhao(editDraft, setEditDraft, {
                        jornadaHoras: parseDecimal(event.target.value) ?? 0,
                      })
                    }
                  />
                </div>
                {podeUsarProdutor ? (
                  <Button type="button" variant="outline" full onClick={handleUsarProdutorNoDraft}>
                    Usar área e plantas do cadastro
                  </Button>
                ) : null}
                <p className="text-xs font-semibold text-ink">Etapas do ciclo</p>
                <p className="text-xs text-soil">
                  A primeira não tem intervalo. As demais levam os dias desde a etapa anterior.
                </p>
                <EditorEtapas
                  stages={editDraft.stages}
                  onChange={(stages) => setEditDraft({ ...editDraft, stages })}
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
                <p className="shrink-0 text-xs text-soil">{diasTotais(item)} dias</p>
              </div>
              <p className="mt-1 text-xs leading-snug text-soil">
                {item.stages.map((etapa) => etapa.name || '—').join(' → ')}
              </p>
              <p className="mt-1 text-[11px] text-soil">
                {item.talhao.nome || 'Talhão'} · {formatNumber(item.talhao.nPlantas, 0)} plantas ·{' '}
                {formatNumber(item.talhao.areaHa, 1)} ha
              </p>
              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  className="text-[12.5px] text-soil underline underline-offset-2"
                  onClick={() => {
                    setForm({ ...form, selecionadaId: item.id })
                    abrirEdicao(item)
                  }}
                >
                  Editar
                </button>
                {form.variedades.length > 1 ? (
                  <button
                    type="button"
                    className="text-[12.5px] text-soil underline underline-offset-2 hover:text-danger"
                    onClick={() => handleRemoverVariedade(item.id)}
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
            if (opening) setAddDraft(rascunhoCadastro())
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
            <p className="text-xs font-semibold text-ink">Talhão</p>
            <Input
              label="Nome do talhão (opcional)"
              name="newTalhaoNome"
              placeholder="Ex: Parcela 10"
              value={addDraft.talhaoNome}
              onChange={(event) => setAddDraft({ ...addDraft, talhaoNome: event.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nº de plantas"
                name="newNPlantas"
                inputMode="numeric"
                value={addDraft.nPlantas}
                onChange={(event) => setAddDraft({ ...addDraft, nPlantas: event.target.value })}
              />
              <Input
                label="Área (ha)"
                name="newAreaHa"
                inputMode="decimal"
                value={addDraft.areaHa}
                onChange={(event) => setAddDraft({ ...addDraft, areaHa: event.target.value })}
              />
              <Input
                label="Valor da diária (R$)"
                name="newValorDiaria"
                inputMode="decimal"
                value={addDraft.valorDiaria}
                onChange={(event) => setAddDraft({ ...addDraft, valorDiaria: event.target.value })}
              />
              <Input
                label="Jornada (h/dia)"
                name="newJornada"
                inputMode="decimal"
                value={addDraft.jornadaHoras}
                onChange={(event) => setAddDraft({ ...addDraft, jornadaHoras: event.target.value })}
              />
            </div>
            <p className="text-xs font-semibold text-ink">Etapas do ciclo</p>
            <EditorEtapas
              stages={addDraft.stages}
              onChange={(stages) => setAddDraft({ ...addDraft, stages })}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleNovaVariedade}>
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="space-y-5">
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-field">Calculadora</h2>
          <p className="text-sm text-soil">
            Escolha a variedade e a data desejada da última etapa para gerar o calendário do ciclo.
            Dentro de cada etapa, monte o plano de operações semana a semana.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Select
              label="Variedade"
              name="varietySelect"
              value={form.selecionadaId}
              onChange={(event) => {
                setForm({ ...form, selecionadaId: event.target.value })
                setPlanosAbertos({})
              }}
            >
              {form.variedades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <DateField
              label={`Data desejada: ${ultimaEtapa?.name || 'última etapa'}`}
              name="dataAlvo"
              value={form.dataAlvo}
              onChange={gravarColheita}
            />
            <Button type="button" variant="secondary" onClick={handleCalcular}>
              Calcular
            </Button>
          </div>

          <div ref={resultRef}>
            {datas ? (
              <>
                <div className="relative mt-4 space-y-1 border-l border-line pl-6">
                  {variedade.stages.map((etapa, index) => {
                    const data = datas[index]
                    const isTarget = index === variedade.stages.length - 1
                    const proxima = variedade.stages[index + 1]
                    const semanas = proxima?.weeks ?? []
                    const planoId = proxima?.id ?? etapa.id
                    const aberto = planosAbertos[planoId] ?? index === 0
                    return (
                      <div key={etapa.id}>
                        <div className="relative pb-2">
                          <span
                            className={cn(
                              'absolute -left-6 top-1.5 h-2.5 w-2.5 -translate-x-[5px] rounded-full border-2 bg-paper',
                              isTarget ? 'border-mango bg-mango' : 'border-soil',
                            )}
                          />
                          <p className="text-sm font-semibold text-ink">{etapa.name || '(sem nome)'}</p>
                          <p
                            className={cn(
                              'font-display text-xl font-semibold',
                              isTarget ? 'text-mango' : 'text-field',
                            )}
                          >
                            {data ? formatBrUtc(data) : '—'}
                          </p>
                          {index > 0 ? (
                            <p className="text-xs text-soil">
                              {etapa.days ?? 0} dias após a etapa anterior
                            </p>
                          ) : null}
                        </div>

                        {proxima ? (
                          <div className="mb-5">
                            <button
                              type="button"
                              className="py-1 text-left text-[12.5px] text-soil"
                              onClick={() =>
                                setPlanosAbertos((atual) => ({ ...atual, [planoId]: !aberto }))
                              }
                            >
                              {aberto ? '▾' : '▸'} Plano de operações — {etapa.name} → {proxima.name}{' '}
                              ({semanas.length} semanas)
                            </button>
                            {aberto ? (
                              <div className="mt-1">
                                {semanas.map((week) => {
                                  const dataSemana = data ? addDaysUtc(data, week.offset) : null
                                  const iso = dataSemana ? isoAnoSemanaUtc(dataSemana) : null
                                  return (
                                    <div key={week.id} className="border-t border-line py-2.5 first:border-0">
                                      <p className="mb-2 text-[12.5px] font-semibold text-ink">
                                        {dataSemana ? formatBrUtc(dataSemana) : `Dia ${week.offset}`}{' '}
                                        <span className="font-normal text-soil">dia {week.offset}</span>
                                        {iso ? (
                                          <span className="font-normal text-soil">
                                            {' '}
                                            · {iso.year} · sem. {iso.week}
                                          </span>
                                        ) : null}
                                      </p>
                                      <div className="grid gap-2.5 sm:grid-cols-3">
                                        {week.ops.map((op, opIndex) => {
                                          const chave = `${week.id}-${opIndex}`
                                          return (
                                            <OperacaoCard
                                              key={chave}
                                              idPrefix={chave}
                                              op={op}
                                              talhao={variedade.talhao}
                                              laborAberto={Boolean(calcAberto[chave]?.labor)}
                                              machineAberto={Boolean(calcAberto[chave]?.machine)}
                                              onToggleLabor={() =>
                                                setCalcAberto((atual) => ({
                                                  ...atual,
                                                  [chave]: {
                                                    ...atual[chave],
                                                    labor: !atual[chave]?.labor,
                                                  },
                                                }))
                                              }
                                              onToggleMachine={() =>
                                                setCalcAberto((atual) => ({
                                                  ...atual,
                                                  [chave]: {
                                                    ...atual[chave],
                                                    machine: !atual[chave]?.machine,
                                                  },
                                                }))
                                              }
                                              onChange={(next) =>
                                                patchOp(proxima.id, week.id, opIndex, next)
                                              }
                                            />
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-soil">
                  Ciclo total: {diasTotais(variedade)} dias, de “{variedade.stages[0]?.name}” até “
                  {ultimaEtapa?.name}”.
                </p>
              </>
            ) : (
              <Banner>Escolha a data desejada para ver o calendário do ciclo.</Banner>
            )}
          </div>
        </Card>

        {custos && datas ? (
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-field">Resumo de custos do ciclo</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Custo total do ciclo" value={formatCurrency(custos.total)} />
              <Metric label="Custo por planta" value={formatCurrency(custos.porPlanta)} />
              <Metric label="Custo por hectare" value={formatCurrency(custos.porHa)} />
            </div>
            {custos.entries.length === 0 ? (
              <p className="text-sm text-soil">
                Nenhuma operação com custo preenchido ainda. Abra Mão de obra ou Hora máquina no
                cartão da semana.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[30rem] w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-[11.5px] font-semibold text-soil">
                        <th className="border-b border-line pb-1.5 pr-2 font-semibold">Operação</th>
                        <th className="border-b border-line pb-1.5 pr-2 font-semibold">Etapa</th>
                        <th className="border-b border-line pb-1.5 pr-2 font-semibold">Dia</th>
                        <th className="border-b border-line pb-1.5 pr-2 font-semibold">R$ total</th>
                        <th className="border-b border-line pb-1.5 font-semibold">% do custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {custos.entries.map((item, index) => (
                        <tr key={`${item.nome}-${item.offset}-${index}`}>
                          <td className="border-b border-line py-1.5 pr-2 font-medium text-ink">
                            {item.nome}
                          </td>
                          <td className="border-b border-line py-1.5 pr-2 text-soil">{item.etapa}</td>
                          <td className="border-b border-line py-1.5 pr-2 tabular-nums">{item.offset}</td>
                          <td className="border-b border-line py-1.5 pr-2 tabular-nums">
                            {formatCurrency(item.rTotal)}
                          </td>
                          <td className="border-b border-line py-1.5 tabular-nums">
                            {formatNumber(item.pct, 1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <GraficoPizza
                  centro={formatCurrency(custos.total)}
                  formatValor={formatCurrency}
                  rotuloParte="do custo"
                  fatias={custos.entries.map((item) => ({
                    label: item.nome,
                    value: item.rTotal,
                    detalhe: `dia ${item.offset} · ${formatNumber(item.pct, 1)}%`,
                  }))}
                />
              </>
            )}
          </Card>
        ) : null}

        <Button
          type="button"
          variant="outline"
          full
          disabled={!form.dataAlvo}
          onClick={() =>
            exportarCalendarioPdf(
              variedade,
              form.dataAlvo,
              datas,
              custos ?? { entries: [], total: 0, porPlanta: 0, porHa: 0 },
              propriedade,
              produtor,
            )
          }
        >
          Exportar PDF
        </Button>
        <Button type="button" variant="ghost" full onClick={handleRestaurarPalmer}>
          Usar Palmer de exemplo
        </Button>
        <Link to="/safra" className="block text-center text-sm font-semibold text-field">
          Calcular as datas da safra
        </Link>
      </div>
    </div>
  )
}

interface EditDraft {
  id: string
  name: string
  talhao: TalhaoCalendario
  stages: EtapaRascunho[]
}

interface AddDraft {
  name: string
  talhaoNome: string
  nPlantas: string
  areaHa: string
  valorDiaria: string
  jornadaHoras: string
  stages: EtapaRascunho[]
}

function rascunhoCadastro(): AddDraft {
  return {
    name: '',
    talhaoNome: '',
    nPlantas: '2000',
    areaHa: '2',
    valorDiaria: '100',
    jornadaHoras: '8',
    stages: rascunhoNovo(),
  }
}

function patchDraftTalhao(
  draft: EditDraft,
  setDraft: (next: EditDraft) => void,
  patch: Partial<TalhaoCalendario>,
) {
  setDraft({ ...draft, talhao: { ...draft.talhao, ...patch } })
}

function EditorEtapas({
  stages,
  onChange,
}: {
  stages: EtapaRascunho[]
  onChange: (next: EtapaRascunho[]) => void
}) {
  return (
    <div className="space-y-2">
      {stages.map((etapa, index) => (
        <div
          key={etapa.id}
          className={cn('grid items-center gap-2', index === 0 ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr_4.5rem_auto]')}
        >
          <input
            type="text"
            className="min-h-11 w-full rounded-leaf border-0 bg-cream px-3 text-sm font-medium text-ink outline-none focus:bg-paper focus:shadow-[0_0_0_2px_var(--color-field)]"
            placeholder={index === 0 ? 'Nome da 1ª etapa' : 'Nome da etapa'}
            value={etapa.name}
            onChange={(event) =>
              onChange(
                stages.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)),
              )
            }
          />
          {index > 0 ? (
            <input
              type="text"
              inputMode="numeric"
              lang="pt-BR"
              className="min-h-11 w-full rounded-leaf border-0 bg-cream px-2 text-center text-sm font-medium text-ink outline-none focus:bg-paper focus:shadow-[0_0_0_2px_var(--color-field)]"
              placeholder="dias"
              value={etapa.days != null ? String(etapa.days) : ''}
              onChange={(event) =>
                onChange(
                  stages.map((item, i) =>
                    i === index ? { ...item, days: Math.max(0, parseDecimal(event.target.value) ?? 0) } : item,
                  ),
                )
              }
            />
          ) : null}
          <button
            type="button"
            className="flex h-11 w-8 items-center justify-center text-lg text-soil"
            style={{ visibility: stages.length <= 2 ? 'hidden' : 'visible' }}
            title="Remover"
            onClick={() => {
              if (stages.length <= 2) return
              onChange(stages.filter((_, i) => i !== index))
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded-leaf border border-dashed border-line px-2.5 py-1.5 text-xs text-soil"
        onClick={() => onChange([...stages, { id: createId(), name: '', days: 0 }])}
      >
        + Adicionar etapa
      </button>
    </div>
  )
}

function OperacaoCard({
  idPrefix,
  op,
  talhao,
  laborAberto,
  machineAberto,
  onToggleLabor,
  onToggleMachine,
  onChange,
}: {
  idPrefix: string
  op: OperacaoSemana
  talhao: TalhaoCalendario
  laborAberto: boolean
  machineAberto: boolean
  onToggleLabor: () => void
  onToggleMachine: () => void
  onChange: (next: OperacaoSemana) => void
}) {
  const labor = laborCalc(op.labor)
  const maquina = machineCalc(op.machine, talhao.jornadaHoras, talhao.nPlantas)
  const custo = custoDaOperacao(op, talhao)

  function patchLabor(patch: Partial<LaborOp>) {
    onChange({ ...op, labor: { ...op.labor, ...patch } })
  }

  function patchMachine(patch: Partial<MachineOp>) {
    onChange({ ...op, machine: { ...op.machine, ...patch } })
  }

  return (
    <div className="rounded-leaf border border-line bg-cream p-2">
      <input
        list={`sugestoes-op-${idPrefix}`}
        className="mb-1.5 min-h-11 w-full rounded-leaf border-0 bg-paper px-2 text-[12.5px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-soil/40 focus:shadow-[0_0_0_2px_var(--color-field)]"
        placeholder="Nome da operação"
        value={op.name}
        onChange={(event) => onChange({ ...op, name: event.target.value })}
      />
      <datalist id={`sugestoes-op-${idPrefix}`}>
        {SUGESTOES_OP.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>

      <button
        type="button"
        className="block w-full py-1 text-left text-[11px] text-soil"
        onClick={onToggleLabor}
      >
        {laborAberto ? '▾' : '▸'} Mão de obra
      </button>
      {laborAberto ? (
        <div className="mb-1.5 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <CampoMini
              label="Nº plantas"
              name={`l-np-${idPrefix}`}
              inputMode="numeric"
              value={numField(op.labor.nPlantas)}
              onChange={(value) => patchLabor({ nPlantas: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="Prod./colab./dia"
              name={`l-prod-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.labor.prod)}
              onChange={(value) => patchLabor({ prod: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="R$/diária"
              name={`l-valor-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.labor.valorDiaria)}
              onChange={(value) => patchLabor({ valorDiaria: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="Prazo desejado (dias)"
              name={`l-prazo-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.labor.prazo)}
              onChange={(value) => patchLabor({ prazo: parseDecimal(value) ?? 0 })}
            />
          </div>
          <div className="rounded-leaf bg-paper px-1.5 py-1.5 text-[11px] leading-snug text-soil">
            {labor ? (
              <>
                Colab. necessários/dia: <strong className="text-ink">{formatNumber(labor.colabNecessarios, 0)}</strong>
                <br />
                Total de diárias: <strong className="text-ink">{formatNumber(labor.totalDiarias, 1)}</strong>
                {' · '}
                Dias efetivos: <strong className="text-ink">{formatNumber(labor.diasEfetivos, 1)}</strong>
                <br />
                R$ total: <strong className="text-ink">{formatCurrency(labor.rTotal)}</strong>
                {' · '}
                R$/planta: <strong className="text-ink">{formatCurrency(labor.rPlanta)}</strong>
              </>
            ) : (
              'Preencha produtividade e prazo para calcular.'
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="block w-full border-t border-dashed border-line py-1 text-left text-[11px] text-soil"
        onClick={onToggleMachine}
      >
        {machineAberto ? '▾' : '▸'} Hora máquina
      </button>
      {machineAberto ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <CampoMini
              label="Área/base de cálculo"
              name={`m-area-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.machine.areaBase)}
              onChange={(value) => patchMachine({ areaBase: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="Produtividade (ha/h ou un/h)"
              name={`m-prod-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.machine.produtividade)}
              onChange={(value) => patchMachine({ produtividade: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="R$/hora máquina"
              name={`m-valor-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.machine.valorHora)}
              onChange={(value) => patchMachine({ valorHora: parseDecimal(value) ?? 0 })}
            />
            <CampoMini
              label="Prazo desejado (dias)"
              name={`m-prazo-${idPrefix}`}
              inputMode="decimal"
              value={numField(op.machine.prazo)}
              onChange={(value) => patchMachine({ prazo: parseDecimal(value) ?? 0 })}
            />
          </div>
          <div className="rounded-leaf bg-paper px-1.5 py-1.5 text-[11px] leading-snug text-soil">
            {maquina ? (
              <>
                Máquinas necessárias: <strong className="text-ink">{formatNumber(maquina.maquinasNecessarias, 0)}</strong>
                <br />
                Total de horas: <strong className="text-ink">{formatNumber(maquina.totalHoras, 1)}</strong>
                {' · '}
                Horas efetivas: <strong className="text-ink">{formatNumber(maquina.horasEfetivas, 1)}</strong>
                <br />
                R$ total: <strong className="text-ink">{formatCurrency(maquina.rTotal)}</strong>
                {' · '}
                R$/ha: <strong className="text-ink">{formatCurrency(maquina.rHa)}</strong>
                {' · '}
                R$/planta: <strong className="text-ink">{formatCurrency(maquina.rPlanta)}</strong>
              </>
            ) : (
              'Preencha produtividade e prazo para calcular.'
            )}
          </div>
        </div>
      ) : null}

      {custo.rPlanta > 0 ? (
        <p className="mt-1.5 text-xs font-bold text-mango">
          Valor/planta: {formatCurrency(custo.rPlanta)}
        </p>
      ) : null}
    </div>
  )
}

function CampoMini({
  label,
  name,
  value,
  onChange,
  inputMode,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  inputMode?: 'decimal' | 'numeric'
}) {
  return (
    <label className="block" htmlFor={name}>
      <span className="mb-0.5 block text-[10px] text-soil">{label}</span>
      <input
        id={name}
        name={name}
        lang={inputMode ? 'pt-BR' : undefined}
        inputMode={inputMode}
        className="min-h-10 w-full rounded-leaf border-0 bg-paper px-1.5 text-xs text-ink outline-none focus:shadow-[0_0_0_2px_var(--color-field)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function numField(value: number) {
  return value ? String(value) : ''
}
