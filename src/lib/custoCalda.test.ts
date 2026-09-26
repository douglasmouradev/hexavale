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
    expect(resultado.valorHaAplicacao).toBeCloseTo(1.92)
    expect(resultado.valorOperacaoHa).toBeCloseTo(7.68)
    expect(resultado.maiorCusto?.nome).toBe('Enxofre')
    expect(resultado.maiorCusto?.pct).toBe(100)
  })

  it('bate a planilha da calda orgânica (10.000 L, 200 L/ha, 40 aplicações)', () => {
    const resultado = calcularCustoCalda({
      tankVolume: 10000,
      volPerHa: 200,
      numApps: 40,
      insumos: [
        { id: '1', nome: 'Esterco', qtd: 150, valorUnit: 0.32 },
        { id: '2', nome: 'Farinha de ossos', qtd: 10, valorUnit: 1 },
        { id: '3', nome: 'Torta de mamona', qtd: 100, valorUnit: 2 },
        { id: '4', nome: 'Cinzas de madeira', qtd: 50, valorUnit: 1.2 },
        { id: '5', nome: 'Pó de rocha (Rochagem)', qtd: 100, valorUnit: 0.54 },
      ],
    })
    expect(resultado.totalQtd).toBe(410)
    expect(resultado.totalValor).toBeCloseTo(372)
    expect(resultado.valorLitro).toBeCloseTo(0.0372)
    expect(resultado.volumeCiclo).toBe(8000)
    expect(resultado.valorOperacaoHa).toBeCloseTo(297.6)
    expect(resultado.maiorCusto?.nome).toBe('Torta de mamona')
    expect(resultado.maiorCusto?.pct).toBeCloseTo(53.8, 0)
    expect(resultado.maiorVolume?.nome).toBe('Esterco')
    expect(resultado.maiorVolume?.qtd).toBe(150)
  })
})

describe('parseCustoCaldaCampos', () => {
  it('recusa volume zero', () => {
    expect(
      parseCustoCaldaCampos({ tankVolume: '0', volPerHa: '400', numApps: '3' }),
    ).toEqual({ error: 'Informe o volume do tanque.' })
  })
})
