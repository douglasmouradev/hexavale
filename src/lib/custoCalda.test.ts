import { describe, expect, it } from 'vitest'
import { calcularCustoCalda, parseCustoCaldaCampos } from '@/lib/custoCalda'

describe('calcularCustoCalda', () => {
  it('calcula o litro e o hectare do ciclo', () => {
    const resultado = calcularCustoCalda({
      tankVolume: 10000,
      volPerHa: 400,
      numApps: 4,
      insumos: [{ id: '1', nome: 'Enxofre', qtd: 150, valorUnit: 0.32 }],
    })
    expect(resultado.totalValor).toBeCloseTo(48)
    expect(resultado.valorLitro).toBeCloseTo(0.0048)
    expect(resultado.volumeCiclo).toBe(1600)
    expect(resultado.valorOperacaoHa).toBeCloseTo(7.68)
    expect(resultado.maiorCusto?.nome).toBe('Enxofre')
    expect(resultado.maiorCusto?.pct).toBe(100)
  })
})

describe('parseCustoCaldaCampos', () => {
  it('recusa volume zero', () => {
    expect(
      parseCustoCaldaCampos({ tankVolume: '0', volPerHa: '400', numApps: '3' }),
    ).toEqual({ error: 'Informe o volume do tanque.' })
  })
})
