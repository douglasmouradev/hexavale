/**
 * Calendário da mangueira: datas a partir da colheita e custos
 * de mão de obra / hora-máquina nas semanas de cada intervalo.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSplit } from '@/components/layout/PageSplit'
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
import {
  custosDoCiclo,
  datasDasEtapas,
  diasTotais,
  formatBrUtc,
  laborCalc,
  machineCalc,
  palmerPadrao,
  regenerateWeeks,
  variedadeSimples,
  type LaborOp,
  type MachineOp,
  type OperacaoSemana,
  type VariedadeManga,
} from '@/lib/calendarioManga'
import { formatCurrency, formatNumber, parseDecimal, cn } from '@/lib/format'
import { exportarCalendarioPdf } from '@/lib/exportarPdf'

interface CalendarioState {
  dataAlvo: string
  variedades: VariedadeManga[]
  selecionadaId: string
}

const INICIAL_VARIEDADE = variedadeSimples('Minha variedade', 60, 90, 30, 140)
const INITIAL: CalendarioState = {
  dataAlvo: '',
  variedades: [INICIAL_VARIEDADE],
  selecionadaId: INICIAL_VARIEDADE.id,
}

export function CalendarioPage() {
  const { propriedade, produtor } = useApp()
  const [form, setForm] = usePersistedState(STORAGE_KEYS.calendario, INITIAL)
  const [etapaAberta, setEtapaAberta] = useState<string | null>(null)
  const [semanaAberta, setSemanaAberta] = useState<string | null>(null)
  const [editarOperacoes, setEditarOperacoes] = useState(false)

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

  function handleNovaVariedade() {
    if (!variedade) return
    const criada = variedadeSimples('Nova variedade', 60, 90, 30, 140)
    setForm((current) => ({
      ...current,
      variedades: [...current.variedades, criada],
      selecionadaId: criada.id,
    }))
    setEtapaAberta(null)
    setSemanaAberta(null)
  }

  function handleRemoverVariedade() {
    if (!variedade || form.variedades.length <= 1) return
    setForm((current) => {
      const resto = current.variedades.filter((item) => item.id !== variedade.id)
      return { ...current, variedades: resto, selecionadaId: resto[0]!.id }
    })
    setEtapaAberta(null)
  }

  function handleRestaurarPalmer() {
    const palmer = palmerPadrao()
    setForm({ dataAlvo: form.dataAlvo, variedades: [palmer], selecionadaId: palmer.id })
    setEtapaAberta(null)
    setSemanaAberta(null)
  }

  function handlePreset(name: string) {
    const chave = name.toLocaleLowerCase('pt-BR')
    const existente = form.variedades.find(
      (item) => item.name.toLocaleLowerCase('pt-BR') === chave,
    )
    if (existente) {
      setForm({ ...form, selecionadaId: existente.id })
      return
    }
    const criada = variedadeSimples(name, 60, 90, 30, 140)
    setForm((current) => ({
      ...current,
      variedades: [...current.variedades, criada],
      selecionadaId: criada.id,
    }))
    setEtapaAberta(null)
    setSemanaAberta(null)
  }

  if (produtor.cultura === 'uva') {
    return (
      <Card className="space-y-3">
        <p className="font-bold text-ink">Ferramenta da mangueira</p>
        <p className="text-sm text-soil">
          O calendário conta poda, regulador e florada da manga. Na uva, use o Ciclo de 42 semanas.
        </p>
        <Link to="/ciclo" className="block">
          <Button full>Abrir ciclo</Button>
        </Link>
      </Card>
    )
  }

  if (!variedade) return null

  return (
    <PageSplit
      aside={
        <>
          <Button
            type="button"
            variant="outline"
            full
            className="desk:hidden"
            onClick={() => setEditarOperacoes((atual) => !atual)}
          >
            {editarOperacoes ? 'Ver só as datas' : 'Editar operações'}
          </Button>
          <div className={cn(!editarOperacoes && 'hidden desk:block')}>
          {variedade.stages.map((etapa, index) => {
            if (index === 0) return null
            const anterior = variedade.stages[index - 1]!
            const aberta = etapaAberta === etapa.id
            const dataBase = datas?.[index - 1]
            return (
              <Card key={etapa.id} className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-3 text-left"
                  onClick={() => {
                    setEtapaAberta(aberta ? null : etapa.id)
                    setSemanaAberta(null)
                  }}
                >
                  <span>
                    <span className="block font-bold text-ink">{etapa.name}</span>
                    <span className="block text-sm text-soil">
                      {anterior.name} → {etapa.name}
                    </span>
                  </span>
                  <span className="text-sm text-mango">{aberta ? 'Fechar' : 'Editar'}</span>
                </button>

                {aberta ? (
                  <>
                    <Input
                      label="Dias neste intervalo"
                      name={`dias-${etapa.id}`}
                      inputMode="numeric"
                      value={String(etapa.days ?? '')}
                      onChange={(event) => {
                        const days = Math.max(0, parseDecimal(event.target.value) ?? 0)
                        const next = { ...etapa, days, weeks: regenerateWeeks({ ...etapa, days }, variedade.talhao) }
                        patchVariedade({
                          ...variedade,
                          stages: variedade.stages.map((item) => (item.id === etapa.id ? next : item)),
                        })
                      }}
                    />
                    {(etapa.weeks ?? []).map((week) => {
                      const semanaEstaAberta = semanaAberta === week.id
                      const dataSemana = dataBase ? new Date(dataBase.getTime()) : null
                      if (dataSemana) dataSemana.setUTCDate(dataSemana.getUTCDate() + week.offset)
                      return (
                        <div key={week.id} className="rounded-leaf bg-cream p-3">
                          <button
                            type="button"
                            className="flex w-full items-baseline justify-between gap-2 text-left"
                            onClick={() => setSemanaAberta(semanaEstaAberta ? null : week.id)}
                          >
                            <span className="font-medium text-ink">
                              Dia {week.offset}
                              {dataSemana ? ` · ${formatBrUtc(dataSemana)}` : ''}
                            </span>
                            <span className="text-sm text-field">
                              {semanaEstaAberta ? 'Fechar' : 'Operações'}
                            </span>
                          </button>
                          {semanaEstaAberta
                            ? week.ops.map((op, opIndex) => (
                                <OperacaoEditor
                                  key={`${week.id}-${opIndex}`}
                                  idPrefix={week.id}
                                  indice={opIndex}
                                  op={op}
                                  jornadaHoras={variedade.talhao.jornadaHoras}
                                  nPlantasTalhao={variedade.talhao.nPlantas}
                                  onChange={(next) => {
                                    const weeks = (etapa.weeks ?? []).map((item) =>
                                      item.id === week.id
                                        ? {
                                            ...item,
                                            ops: item.ops.map((atual, i) =>
                                              i === opIndex ? next : atual,
                                            ) as typeof item.ops,
                                          }
                                        : item,
                                    )
                                    patchVariedade({
                                      ...variedade,
                                      stages: variedade.stages.map((item) =>
                                        item.id === etapa.id ? { ...item, weeks } : item,
                                      ),
                                    })
                                  }}
                                />
                              ))
                            : null}
                        </div>
                      )
                    })}
                  </>
                ) : null}
              </Card>
            )
          })}
          </div>

          {custos && custos.total > 0 ? (
            <Card className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Custos da mangueira</h2>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Ciclo" value={formatCurrency(custos.total)} />
                <Metric label="Por planta" value={formatCurrency(custos.porPlanta)} />
                <Metric label="Por hectare" value={formatCurrency(custos.porHa)} />
                <Metric label="Operações" value={String(custos.entries.length)} />
              </div>
              <GraficoPizza
                centro={formatCurrency(custos.total)}
                formatValor={formatCurrency}
                fatias={custos.entries.slice(0, 8).map((item) => ({
                  label: item.nome,
                  value: item.rTotal,
                  detalhe: `dia ${item.offset}`,
                }))}
              />
              {custos.entries.slice(0, 6).map((item, index) => (
                <div key={`${item.nome}-${item.offset}-${index}`} className="flex justify-between gap-3">
                  <span className="font-medium text-ink">{item.nome}</span>
                  <span className="text-right text-field-dark">{formatCurrency(item.rTotal)}</span>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-soil">
                Preencha produtividade e prazo nas operações de cada semana para ver o custo do ciclo.
                A Palmer já traz a poda (40 plantas/dia, 5 dias) como exemplo.
              </p>
            </Card>
          )}
        </>
      }
    >
      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Colheita e variedade</h2>
        <p className="text-sm text-soil">
          A data da colheita é o alvo. As etapas anteriores entram contando os dias para trás.
          O Ciclo de 42 semanas é o caderno; aqui só as datas da mangueira.
        </p>
        <DateField
          label="Data desejada da colheita"
          name="dataAlvo"
          value={form.dataAlvo}
          onChange={(iso) => setForm({ ...form, dataAlvo: iso })}
        />
        <Select
          label="Variedade"
          name="variedade"
          value={form.selecionadaId}
          onChange={(event) => {
            setForm({ ...form, selecionadaId: event.target.value })
            setEtapaAberta(null)
            setSemanaAberta(null)
          }}
        >
          {form.variedades.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Input
          label="Nome da variedade"
          name="nomeVariedade"
          value={variedade.name}
          onChange={(event) => patchVariedade({ ...variedade, name: event.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={handleNovaVariedade}>
            Nova
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoverVariedade}
            disabled={form.variedades.length <= 1}
          >
            Remover
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="ghost" onClick={() => handlePreset('Tommy Atkins')}>
            Tommy Atkins
          </Button>
          <Button type="button" variant="ghost" onClick={() => handlePreset('Keitt')}>
            Keitt
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Talhão</h2>
        <Input
          label="Nome do talhão"
          name="talhaoNome"
          value={variedade.talhao.nome}
          onChange={(event) =>
            patchVariedade({
              ...variedade,
              talhao: { ...variedade.talhao, nome: event.target.value },
            })
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Plantas"
            name="nPlantas"
            inputMode="numeric"
            value={String(variedade.talhao.nPlantas || '')}
            onChange={(event) =>
              patchVariedade({
                ...variedade,
                talhao: {
                  ...variedade.talhao,
                  nPlantas: parseDecimal(event.target.value) ?? 0,
                },
              })
            }
          />
          <Input
            label="Área (ha)"
            name="areaHa"
            inputMode="decimal"
            value={String(variedade.talhao.areaHa || '')}
            onChange={(event) =>
              patchVariedade({
                ...variedade,
                talhao: {
                  ...variedade.talhao,
                  areaHa: parseDecimal(event.target.value) ?? 0,
                },
              })
            }
          />
          <Input
            label="Diária (R$)"
            name="valorDiaria"
            inputMode="decimal"
            value={String(variedade.talhao.valorDiaria || '')}
            onChange={(event) =>
              patchVariedade({
                ...variedade,
                talhao: {
                  ...variedade.talhao,
                  valorDiaria: parseDecimal(event.target.value) ?? 0,
                },
              })
            }
          />
          <Input
            label="Jornada (h)"
            name="jornadaHoras"
            inputMode="decimal"
            value={String(variedade.talhao.jornadaHoras || '')}
            onChange={(event) =>
              patchVariedade({
                ...variedade,
                talhao: {
                  ...variedade.talhao,
                  jornadaHoras: parseDecimal(event.target.value) ?? 0,
                },
              })
            }
          />
        </div>
      </Card>

      {datas ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink">Linha do tempo</h2>
          <p className="text-sm text-soil">
            Ciclo de {diasTotais(variedade)} dias, da poda até a colheita.
          </p>
          {variedade.stages.map((etapa, index) => {
            const data = datas[index]
            const anterior = index > 0 ? variedade.stages[index - 1] : null
            return (
              <div key={etapa.id} className="border-b border-line py-2.5 last:border-0">
                <p className="font-medium text-ink">{etapa.name}</p>
                <p className="text-sm text-soil">
                  {data ? formatBrUtc(data) : '—'}
                  {etapa.days
                    ? ` · ${etapa.days} dias após ${anterior?.name ?? 'início'}`
                    : ' · ponto de partida'}
                </p>
              </div>
            )
          })}
        </Card>
      ) : (
        <Banner>Escolha a data desejada da colheita para ver as etapas.</Banner>
      )}

      <Button
        type="button"
        variant="secondary"
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
      <Button type="button" variant="outline" full onClick={handleRestaurarPalmer}>
        Usar Palmer de exemplo
      </Button>
    </PageSplit>
  )
}

function OperacaoEditor({
  idPrefix,
  indice,
  op,
  jornadaHoras,
  nPlantasTalhao,
  onChange,
}: {
  idPrefix: string
  indice: number
  op: OperacaoSemana
  jornadaHoras: number
  nPlantasTalhao: number
  onChange: (next: OperacaoSemana) => void
}) {
  const labor = laborCalc(op.labor)
  const maquina = machineCalc(op.machine, jornadaHoras, nPlantasTalhao)

  function patchLabor(patch: Partial<LaborOp>) {
    onChange({ ...op, labor: { ...op.labor, ...patch } })
  }

  function patchMachine(patch: Partial<MachineOp>) {
    onChange({ ...op, machine: { ...op.machine, ...patch } })
  }

  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <p className="text-sm font-bold text-soil">Operação {indice + 1}</p>
      <Input
        label="Nome"
        name={`op-nome-${idPrefix}-${indice}`}
        value={op.name}
        onChange={(event) => onChange({ ...op, name: event.target.value })}
      />
      <p className="text-xs font-semibold text-soil">Mão de obra</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Plantas/dia"
          name={`lab-prod-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.labor.prod)}
          onChange={(event) => patchLabor({ prod: parseDecimal(event.target.value) ?? 0 })}
        />
        <Input
          label="Prazo (dias)"
          name={`lab-prazo-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.labor.prazo)}
          onChange={(event) => patchLabor({ prazo: parseDecimal(event.target.value) ?? 0 })}
        />
        <Input
          label="Plantas"
          name={`lab-np-${idPrefix}-${indice}`}
          inputMode="numeric"
          value={numField(op.labor.nPlantas)}
          onChange={(event) => patchLabor({ nPlantas: parseDecimal(event.target.value) ?? 0 })}
        />
        <Input
          label="Diária (R$)"
          name={`lab-diaria-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.labor.valorDiaria)}
          onChange={(event) => patchLabor({ valorDiaria: parseDecimal(event.target.value) ?? 0 })}
        />
      </div>
      {labor ? (
        <p className="text-sm text-soil">
          {formatNumber(labor.colabNecessarios, 0)} colaborador(es) ·{' '}
          {formatCurrency(labor.rTotal)}
        </p>
      ) : null}
      <p className="text-xs font-semibold text-soil">Máquina</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="ha / hora"
          name={`maq-prod-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.machine.produtividade)}
          onChange={(event) =>
            patchMachine({ produtividade: parseDecimal(event.target.value) ?? 0 })
          }
        />
        <Input
          label="R$ / hora"
          name={`maq-vh-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.machine.valorHora)}
          onChange={(event) => patchMachine({ valorHora: parseDecimal(event.target.value) ?? 0 })}
        />
        <Input
          label="Área (ha)"
          name={`maq-area-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.machine.areaBase)}
          onChange={(event) => patchMachine({ areaBase: parseDecimal(event.target.value) ?? 0 })}
        />
        <Input
          label="Prazo (dias)"
          name={`maq-prazo-${idPrefix}-${indice}`}
          inputMode="decimal"
          value={numField(op.machine.prazo)}
          onChange={(event) => patchMachine({ prazo: parseDecimal(event.target.value) ?? 0 })}
        />
      </div>
      {maquina ? (
        <p className="text-sm text-soil">
          {formatNumber(maquina.maquinasNecessarias, 0)} máquina(s) · {formatCurrency(maquina.rTotal)}
        </p>
      ) : null}
    </div>
  )
}

function numField(value: number) {
  return value ? String(value) : ''
}
