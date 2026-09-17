import { describe, expect, it } from 'vitest'
import {
  compactarVariedade,
  datasDasEtapas,
  expandirVariedade,
  formatBrUtc,
  palmerPadrao,
  variedadeSimples,
} from '@/lib/calendarioManga'

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
