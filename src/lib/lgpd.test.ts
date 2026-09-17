import { describe, expect, it } from 'vitest'
import { parsePacoteTitular } from '@/lib/lgpd'

describe('parsePacoteTitular', () => {
  it('recusa JSON que não é cópia do HexaVale', () => {
    expect(parsePacoteTitular({ foo: 1 })).toBeNull()
    expect(parsePacoteTitular({ propriedade: { nome: 'Sítio' } })).toBeNull()
    expect(parsePacoteTitular({ propriedade: 'texto' })).toBeNull()
  })

  it('aceita propriedade com nome e telefone', () => {
    const pacote = parsePacoteTitular({
      propriedade: { nome: 'Sítio Vale', telefone: '(87) 99999-9999', loggedAt: '2026-01-01T00:00:00.000Z' },
    })
    expect(pacote?.propriedade).toEqual({
      nome: 'Sítio Vale',
      telefone: '87999999999',
      loggedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('ignora cultura inválida e ciclo sem semanas', () => {
    expect(parsePacoteTitular({ produtor: { cultura: 'banana' } })).toBeNull()
    expect(
      parsePacoteTitular({
        ciclo: { semanas: [{ numero: 99, dataInicio: 'x', dataFim: 'y' }] },
      }),
    ).toBeNull()
  })

  it('mantém só as semanas 1–42 com data', () => {
    const pacote = parsePacoteTitular({
      ciclo: {
        semanas: [
          { numero: 1, dataInicio: '2026-01-01', dataFim: '2026-01-07', insumos: [] },
          { numero: 99, dataInicio: '2026-01-01', dataFim: '2026-01-07' },
        ],
      },
    })
    const ciclo = pacote?.ciclo as { semanas: Array<{ numero: number }> }
    expect(ciclo.semanas).toHaveLength(1)
    expect(ciclo.semanas[0]?.numero).toBe(1)
  })
})
