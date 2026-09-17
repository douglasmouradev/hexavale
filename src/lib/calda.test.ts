import { describe, expect, it } from 'vitest'
import { calcularCalda, parseCaldaCampos } from '@/lib/calda'

describe('calcularCalda', () => {
  it('monta 2 tanques e converte ml/L para litros', () => {
    const resultado = calcularCalda({
      tanqueLitros: 2000,
      areaHectares: 10,
      litrosPorHectare: 400,
      tanqueParcial: true,
      insumos: [{ id: '1', nome: 'Ureia', dose: 2, unidade: 'ml/L' }],
    })
    expect(resultado.volumeAreaLitros).toBe(4000)
    expect(resultado.tanquesNecessarios).toBe(2)
    expect(resultado.volumePrepararLitros).toBe(4000)
    expect(resultado.ultimoTanqueLitros).toBe(2000)
    expect(resultado.insumos[0]?.quantidadeTotal).toBe(8)
    expect(resultado.insumos[0]?.unidadeTotal).toBe('L')
  })

  it('enche tanques cheios quando o parcial está desligado', () => {
    const resultado = calcularCalda({
      tanqueLitros: 2000,
      areaHectares: 10,
      litrosPorHectare: 250,
      tanqueParcial: false,
      insumos: [{ id: '1', nome: 'Cobre', dose: 1, unidade: 'g/L' }],
    })
    expect(resultado.volumeAreaLitros).toBe(2500)
    expect(resultado.tanquesNecessarios).toBe(2)
    expect(resultado.ultimoTanqueLitros).toBe(500)
    expect(resultado.volumePrepararLitros).toBe(4000)
    expect(resultado.insumos[0]?.quantidadeTotal).toBe(4)
    expect(resultado.insumos[0]?.unidadeTotal).toBe('kg')
  })

  it('usa a área nas doses por hectare', () => {
    const resultado = calcularCalda({
      tanqueLitros: 1000,
      areaHectares: 2,
      litrosPorHectare: 400,
      tanqueParcial: true,
      insumos: [{ id: '1', nome: 'Óleo', dose: 1.5, unidade: 'L/ha' }],
    })
    expect(resultado.insumos[0]?.quantidadeTotal).toBe(3)
    expect(resultado.insumos[0]?.unidadeTotal).toBe('L')
  })
})

describe('parseCaldaCampos', () => {
  it('pede tanque, área e litros por hectare', () => {
    expect(parseCaldaCampos({ tanqueLitros: '', areaHectares: '1', litrosPorHectare: '400' })).toEqual({
      error: 'Informe o tanque em litros.',
    })
  })

  it('aceita vírgula decimal', () => {
    expect(
      parseCaldaCampos({ tanqueLitros: '2000', areaHectares: '1,5', litrosPorHectare: '400' }),
    ).toEqual({
      tanqueLitros: 2000,
      areaHectares: 1.5,
      litrosPorHectare: 400,
    })
  })
})
