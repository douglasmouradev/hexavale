import { describe, expect, it } from 'vitest'
import {
  aplicarEdicaoVariedade,
  compactarVariedade,
  custosDoCiclo,
  datasDasEtapas,
  expandirVariedade,
  formatBrUtc,
  isoAnoSemanaUtc,
  laborCalc,
  modoOperacao,
  montarNovaVariedade,
  operacaoVazia,
  palmerPadrao,
  parseIsoUtc,
  rascunhoDasEtapas,
  sincronizarTalhao,
  talhaoPadrao,
  variedadeSimples,
} from '@/lib/calendarioManga'

describe('isoAnoSemanaUtc', () => {
  it('bate a semana 37 de 09/09/2026 da planilha', () => {
    expect(isoAnoSemanaUtc(parseIsoUtc('2026-09-09'))).toEqual({ year: 2026, week: 37 })
    expect(isoAnoSemanaUtc(parseIsoUtc('2026-09-16'))).toEqual({ year: 2026, week: 38 })
  })
})

describe('modoOperacao', () => {
  it('marca pulverização mecanizada pelo nome e poda como manual', () => {
    const talhao = talhaoPadrao()
    expect(modoOperacao(operacaoVazia('Pulv. meca. (turbo atomizador)', talhao))).toBe('mecanizado')
    expect(modoOperacao(operacaoVazia('Poda', talhao))).toBe('manual')
  })
})

describe('sincronizarTalhao', () => {
  it('leva plantas e diária novas para a poda de exemplo', () => {
    const palmer = palmerPadrao()
    const next = sincronizarTalhao(palmer, { ...palmer.talhao, nPlantas: 800, valorDiaria: 120 })
    const poda = next.stages[1]?.weeks?.find((week) => week.offset === 0)?.ops[0]
    expect(poda?.labor.nPlantas).toBe(800)
    expect(poda?.labor.valorDiaria).toBe(120)
  })
})

describe('datasDasEtapas', () => {
  it('anda para trás em UTC a partir da colheita', () => {
    const variedade = variedadeSimples('Tommy', 60, 90, 30, 140)
    const datas = datasDasEtapas(variedade, '2026-09-17')
    expect(datas).toHaveLength(5)
    expect(formatBrUtc(datas[4]!)).toBe('17/09/2026')
    expect(formatBrUtc(datas[3]!)).toBe('30/04/2026')
    expect(formatBrUtc(datas[2]!)).toBe('31/03/2026')
    expect(formatBrUtc(datas[1]!)).toBe('31/12/2025')
    expect(formatBrUtc(datas[0]!)).toBe('01/11/2025')
  })

  it('com colheita em 30/10/2027 a poda cai em 14/12/2026', () => {
    const datas = datasDasEtapas(palmerPadrao(), '2027-10-30')
    expect(formatBrUtc(datas[0]!)).toBe('14/12/2026')
    expect(formatBrUtc(datas[1]!)).toBe('12/02/2027')
    expect(formatBrUtc(datas[2]!)).toBe('13/05/2027')
    expect(formatBrUtc(datas[4]!)).toBe('30/10/2027')
  })
})

describe('laborCalc', () => {
  it('bate o exemplo da poda Palmer: 10 colab, 50 diárias, R$ 5.000 e R$ 2,50/planta', () => {
    const poda = palmerPadrao().stages[1]?.weeks?.find((week) => week.offset === 0)?.ops[0]
    const labor = laborCalc(poda!.labor)
    expect(labor).toEqual({
      totalDiarias: 50,
      colabNecessarios: 10,
      diasEfetivos: 5,
      rTotal: 5000,
      rPlanta: 2.5,
    })
  })
})

describe('custosDoCiclo', () => {
  it('diz o percentual de cada operação no ciclo', () => {
    const custos = custosDoCiclo(palmerPadrao())
    expect(custos.total).toBe(5000)
    expect(custos.porPlanta).toBe(2.5)
    expect(custos.entries[0]?.nome).toBe('Poda')
    expect(custos.entries[0]?.pct).toBe(100)
  })
})

describe('aplicarEdicaoVariedade', () => {
  it('acrescenta etapa e guarda as semanas da poda', () => {
    const palmer = palmerPadrao()
    const rascunho = [
      ...rascunhoDasEtapas(palmer.stages),
      { id: 'nova', name: 'Pós-colheita extra', days: 14 },
    ]
    const next = aplicarEdicaoVariedade(palmer, 'Palmer', palmer.talhao, rascunho)
    expect(next.stages).toHaveLength(6)
    expect(next.stages[5]?.days).toBe(14)
    expect(next.stages[5]?.weeks?.length).toBeGreaterThan(0)
    const poda = next.stages[1]?.weeks?.find((week) => week.offset === 0)?.ops[0]
    expect(poda?.labor.prod).toBe(40)
  })
})

describe('montarNovaVariedade', () => {
  it('cria Tommy Atkins com etapas livres', () => {
    const criada = montarNovaVariedade(
      'Tommy Atkins',
      { nome: 'Parcela 10', nPlantas: 2000, areaHa: 2, valorDiaria: 100, jornadaHoras: 8 },
      [
        { id: 'a', name: 'Poda' },
        { id: 'b', name: 'Colheita', days: 140 },
      ],
    )
    expect(criada.name).toBe('Tommy Atkins')
    expect(criada.stages).toHaveLength(2)
    expect(criada.stages[0]?.days).toBeUndefined()
    expect(criada.stages[1]?.weeks?.length).toBeGreaterThan(0)
  })
})

describe('compactarVariedade', () => {
  it('tira semanas vazias e a expansão devolve os intervalos', () => {
    const original = palmerPadrao()
    const regulador = original.stages[1]!
    const cheias = regulador.weeks?.length ?? 0
    const compacta = compactarVariedade(original)
    const reguladorCompacto = compacta.stages[1]!.weeks ?? []
    expect(reguladorCompacto.length).toBeGreaterThan(0)
    expect(reguladorCompacto.length).toBeLessThan(cheias)
    expect(reguladorCompacto.some((week) => week.ops[0]?.labor.prod === 40)).toBe(true)

    const expandida = expandirVariedade(compacta)
    expect(expandida.stages[1]?.weeks?.length).toBe(cheias)
    const semanaPoda = expandida.stages[1]?.weeks?.find((week) => week.offset === 0)
    expect(semanaPoda?.ops[0]?.labor.prod).toBe(40)
  })
})
