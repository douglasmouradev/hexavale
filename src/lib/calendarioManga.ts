/**
 * Calendário da mangueira: etapas a partir da data-alvo e custos
 * de mão de obra / hora-máquina nas semanas de cada intervalo.
 */
import { createId } from '@/lib/id'

export interface TalhaoCalendario {
  nome: string
  nPlantas: number
  areaHa: number
  valorDiaria: number
  jornadaHoras: number
}

export interface LaborOp {
  nPlantas: number
  prod: number
  valorDiaria: number
  prazo: number
}

export interface MachineOp {
  areaBase: number
  produtividade: number
  valorHora: number
  prazo: number
}

export interface OperacaoSemana {
  name: string
  labor: LaborOp
  machine: MachineOp
}

export interface SemanaEtapa {
  id: string
  offset: number
  ops: [OperacaoSemana, OperacaoSemana, OperacaoSemana]
}

export interface EtapaCalendario {
  id: string
  name: string
  days?: number
  weeks?: SemanaEtapa[]
}

export interface VariedadeManga {
  id: string
  name: string
  talhao: TalhaoCalendario
  stages: EtapaCalendario[]
}

export function talhaoPadrao(): TalhaoCalendario {
  return { nome: '', nPlantas: 1000, areaHa: 1, valorDiaria: 100, jornadaHoras: 8 }
}

function laborVazio(talhao: TalhaoCalendario): LaborOp {
  return { nPlantas: talhao.nPlantas, prod: 0, valorDiaria: talhao.valorDiaria, prazo: 0 }
}

function machineVazio(talhao: TalhaoCalendario): MachineOp {
  return { areaBase: talhao.areaHa, produtividade: 0, valorHora: 0, prazo: 0 }
}

export function operacaoVazia(name: string, talhao: TalhaoCalendario): OperacaoSemana {
  return { name, labor: laborVazio(talhao), machine: machineVazio(talhao) }
}

export function offsetsDaEtapa(days: number) {
  const d = Math.max(0, days || 0)
  const offsets: number[] = []
  let cursor = 0
  while (cursor < d) {
    offsets.push(cursor)
    cursor += 7
  }
  offsets.push(d)
  return offsets
}

export function seedWeeks(
  days: number,
  opsMap: Record<number, string[]>,
  talhao: TalhaoCalendario,
): SemanaEtapa[] {
  return offsetsDaEtapa(days).map((offset) => {
    const names = opsMap[offset] ?? []
    return {
      id: createId(),
      offset,
      ops: [
        operacaoVazia(names[0] ?? '', talhao),
        operacaoVazia(names[1] ?? '', talhao),
        operacaoVazia(names[2] ?? '', talhao),
      ],
    }
  })
}

/** Recria as semanas do intervalo, copiando as operações que já existiam no mesmo dia. */
export function regenerateWeeks(stage: EtapaCalendario, talhao: TalhaoCalendario): SemanaEtapa[] {
  const porOffset = new Map((stage.weeks ?? []).map((week) => [week.offset, week]))
  return offsetsDaEtapa(stage.days || 0).map((offset) => {
    const existente = porOffset.get(offset)
    if (existente) return { ...existente, offset }
    return {
      id: createId(),
      offset,
      ops: [
        operacaoVazia('', talhao),
        operacaoVazia('', talhao),
        operacaoVazia('', talhao),
      ],
    }
  })
}

export function palmerPadrao(): VariedadeManga {
  const talhao: TalhaoCalendario = {
    nome: 'Parcela 10',
    nPlantas: 2000,
    areaHa: 2,
    valorDiaria: 100,
    jornadaHoras: 8,
  }
  const poda = seedWeeks(
    60,
    {
      0: ['Poda pós-colheita'],
      7: ['Roçagem mecanizada'],
      14: ['Cont. de ervas daninhas – herbicida'],
      21: ['Pulv. meca. (turbo atomizador)'],
      28: ['Pulv. meca. (turbo atomizador)'],
      35: ['Retirada de malfor. florais'],
    },
    talhao,
  )
  poda[0].ops[0].labor = { nPlantas: talhao.nPlantas, prod: 40, valorDiaria: talhao.valorDiaria, prazo: 5 }

  return {
    id: createId(),
    name: 'Palmer',
    talhao,
    stages: [
      { id: createId(), name: 'Poda pós-colheita' },
      { id: createId(), name: 'Regulador de crescimento', days: 60, weeks: poda },
      {
        id: createId(),
        name: 'Indução floral',
        days: 90,
        weeks: seedWeeks(
          90,
          {
            0: ['Aplicação manual de reg. de cresc.'],
            14: ['Pulv. meca. (turbo atomizador)'],
            28: ['Pulv. meca. (turbo atomizador)'],
            42: ['Cont. de ervas daninhas – herbicida'],
            56: ['Pulv. meca. (turbo atomizador)'],
            63: ['Pulv. meca. (turbo atomizador)'],
            70: ['Pulv. meca. (turbo atomizador)'],
            77: ['Pulv. meca. (turbo atomizador)'],
            84: ['Pulv. meca. (turbo atomizador)'],
            90: ['Pulv. meca. (turbo atomizador)'],
          },
          talhao,
        ),
      },
      {
        id: createId(),
        name: 'Florescimento',
        days: 30,
        weeks: seedWeeks(
          30,
          {
            0: ['Pulv. meca. (turbo atomizador)'],
            7: ['Pulv. meca. (turbo atomizador)'],
            14: ['Pulv. meca. (turbo atomizador)'],
            21: ['Pulv. meca. (turbo atomizador)'],
            28: ['Pulv. meca. (turbo atomizador)'],
            30: ['Pulv. meca. (turbo atomizador)'],
          },
          talhao,
        ),
      },
      {
        id: createId(),
        name: 'Colheita',
        days: 140,
        weeks: offsetsDaEtapa(140).map((offset) => {
          let n1 = ''
          let n2 = ''
          if (offset === 0) n1 = 'Escoramento'
          else if (offset === 14) n1 = 'Batedura de panícula'
          else if (offset === 140) n1 = 'Colheita'
          else if (offset >= 28) n1 = 'Pincelamento de frutos'
          if (offset === 42) n2 = 'Pré-toalete do fruto'
          if (offset === 84) n2 = 'Toalete do fruto'
          return {
            id: createId(),
            offset,
            ops: [
              operacaoVazia(n1, talhao),
              operacaoVazia(n2, talhao),
              operacaoVazia('', talhao),
            ] as SemanaEtapa['ops'],
          }
        }),
      },
    ],
  }
}

export function diasTotais(variedade: VariedadeManga) {
  return variedade.stages.reduce((sum, etapa) => sum + (etapa.days ?? 0), 0)
}

export function parseIsoUtc(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}

export function addDaysUtc(date: Date, days: number) {
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function formatBrUtc(date: Date) {
  const d = String(date.getUTCDate()).padStart(2, '0')
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${date.getUTCFullYear()}`
}

export function datasDasEtapas(variedade: VariedadeManga, dataAlvoIso: string) {
  const stages = variedade.stages
  const n = stages.length
  const dates = new Array<Date>(n)
  dates[n - 1] = parseIsoUtc(dataAlvoIso)
  for (let i = n - 2; i >= 0; i--) {
    dates[i] = addDaysUtc(dates[i + 1]!, -(stages[i + 1]?.days || 0))
  }
  return dates
}

export function laborCalc(labor: LaborOp) {
  const nP = labor.nPlantas || 0
  const prod = labor.prod || 0
  const valorDiaria = labor.valorDiaria || 0
  const prazo = labor.prazo || 0
  if (prod <= 0 || prazo <= 0 || nP <= 0) return null
  const totalDiarias = nP / prod
  const colabNecessarios = Math.max(1, Math.ceil(totalDiarias / prazo))
  const diasEfetivos = totalDiarias / colabNecessarios
  const rTotal = totalDiarias * valorDiaria
  const rPlanta = nP > 0 ? rTotal / nP : 0
  return { totalDiarias, colabNecessarios, diasEfetivos, rTotal, rPlanta }
}

export function machineCalc(machine: MachineOp, jornadaHoras: number, nPlantasTalhao: number) {
  const area = machine.areaBase || 0
  const prod = machine.produtividade || 0
  const valorHora = machine.valorHora || 0
  const prazo = machine.prazo || 0
  if (prod <= 0 || prazo <= 0 || area <= 0) return null
  const totalHoras = area / prod
  const maquinasNecessarias = Math.max(1, Math.ceil(totalHoras / (prazo * (jornadaHoras || 8))))
  const horasEfetivas = totalHoras / maquinasNecessarias
  const rTotal = totalHoras * valorHora
  const rHa = area > 0 ? rTotal / area : 0
  const rPlanta = nPlantasTalhao > 0 ? rTotal / nPlantasTalhao : 0
  return { totalHoras, maquinasNecessarias, horasEfetivas, rTotal, rHa, rPlanta }
}

export function custosDoCiclo(variedade: VariedadeManga) {
  const entries: { nome: string; etapa: string; offset: number; rTotal: number }[] = []
  for (let i = 1; i < variedade.stages.length; i++) {
    const stage = variedade.stages[i]!
    const anterior = variedade.stages[i - 1]!
    for (const week of stage.weeks ?? []) {
      for (const op of week.ops) {
        const lr = laborCalc(op.labor)
        const mr = machineCalc(op.machine, variedade.talhao.jornadaHoras, variedade.talhao.nPlantas)
        if (!lr && !mr) continue
        entries.push({
          nome: op.name || '(sem nome)',
          etapa: `${anterior.name} → ${stage.name}`,
          offset: week.offset,
          rTotal: (lr?.rTotal ?? 0) + (mr?.rTotal ?? 0),
        })
      }
    }
  }
  const total = entries.reduce((sum, item) => sum + item.rTotal, 0)
  return {
    entries: entries.sort((a, b) => b.rTotal - a.rTotal),
    total,
    porPlanta: variedade.talhao.nPlantas > 0 ? total / variedade.talhao.nPlantas : 0,
    porHa: variedade.talhao.areaHa > 0 ? total / variedade.talhao.areaHa : 0,
  }
}

export function variedadeSimples(name: string, p1: number, p2: number, p3: number, p4: number): VariedadeManga {
  const talhao = talhaoPadrao()
  return {
    id: createId(),
    name,
    talhao,
    stages: [
      { id: createId(), name: 'Poda pós-colheita' },
      { id: createId(), name: 'Regulador de crescimento', days: p1, weeks: seedWeeks(p1, {}, talhao) },
      { id: createId(), name: 'Indução floral', days: p2, weeks: seedWeeks(p2, {}, talhao) },
      { id: createId(), name: 'Florescimento', days: p3, weeks: seedWeeks(p3, {}, talhao) },
      { id: createId(), name: 'Colheita', days: p4, weeks: seedWeeks(p4, {}, talhao) },
    ],
  }
}
