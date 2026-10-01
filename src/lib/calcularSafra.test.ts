import { describe, expect, it } from 'vitest'
import {
  diasDoCiclo,
  diasNaoNegativos,
  marcosDaColheita,
  variedadePalmer,
} from '@/lib/calcularSafra'
import { formatBrUtc } from '@/lib/calendarioManga'

describe('marcosDaColheita', () => {
  it('repete o exemplo da safra Palmer: poda em 02/10/2026 e colheita em 18/08/2027', () => {
    const palmer = { ...variedadePalmer(), poda: 60, vegetativo: 90, inducao: 30, floracao: 140 }
    const marcos = marcosDaColheita(palmer, '2027-08-18')

    expect(marcos.map((marco) => marco.nome)).toEqual([
      'Poda → Regulador de Crescimento',
      'Regulador → Indução floral',
      'Indução floral → Florescimento',
      'Florescimento → Colheita',
      'Colheita',
    ])
    expect(marcos.map((marco) => formatBrUtc(marco.data))).toEqual([
      '02/10/2026',
      '01/12/2026',
      '01/03/2027',
      '31/03/2027',
      '18/08/2027',
    ])
    expect(marcos.map((marco) => marco.dias)).toEqual([null, 60, 90, 30, 140])
    expect(marcos[4]?.alvo).toBe(true)
    expect(diasDoCiclo(palmer)).toBe(320)
  })
})

describe('diasNaoNegativos', () => {
  it('não deixa intervalo negativo nem quebrado', () => {
    expect(diasNaoNegativos(-4)).toBe(0)
    expect(diasNaoNegativos(29.6)).toBe(30)
    expect(diasNaoNegativos(Number.NaN)).toBe(0)
  })
})
