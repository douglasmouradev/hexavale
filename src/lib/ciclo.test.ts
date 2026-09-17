import { describe, expect, it } from 'vitest'
import { gerarSemanasCiclo, mesclarSemanas, totaisCiclo } from '@/lib/ciclo'

describe('gerarSemanasCiclo', () => {
  it('fecha a semana 42 no dia da colheita', () => {
    const semanas = gerarSemanasCiclo({ dataColheita: '2026-12-15', cultura: 'manga' })
    expect(semanas).toHaveLength(42)
    expect(semanas[0]?.dataInicio).toBe('2026-02-25')
    expect(semanas[41]?.numero).toBe(42)
    expect(semanas[41]?.dataInicio).toBe('2026-12-09')
    expect(semanas[41]?.dataFim).toBe('2026-12-15')
  })

  it('abre 42 semanas a partir da data de manejo', () => {
    const semanas = gerarSemanasCiclo({ dataInicio: '2026-01-05', cultura: 'uva' })
    expect(semanas).toHaveLength(42)
    expect(semanas[0]?.dataInicio).toBe('2026-01-05')
    expect(semanas[0]?.dataFim).toBe('2026-01-11')
    expect(semanas[41]?.dataFim).toBe('2026-10-25')
  })
})

describe('mesclarSemanas', () => {
  it('mantém lançamentos quando as datas mudam', () => {
    const atuais = gerarSemanasCiclo({ dataColheita: '2026-12-20' })
    const anteriores = gerarSemanasCiclo({ dataColheita: '2026-11-01' })
    anteriores[0]!.insumos.push({ nome: 'Adubo', quantidade: 1, custo: 50, origem: 'insumos' })
    anteriores[0]!.tipoTrabalho = 'Poda extra'
    const mescladas = mesclarSemanas(atuais, anteriores)
    expect(mescladas[0]?.dataFim).not.toBe(anteriores[0]?.dataFim)
    expect(mescladas[0]?.insumos).toEqual(anteriores[0]?.insumos)
    expect(mescladas[0]?.tipoTrabalho).toBe('Poda extra')
  })
})

describe('totaisCiclo', () => {
  it('soma insumos, diária e máquina', () => {
    const semanas = gerarSemanasCiclo({ dataInicio: '2026-01-01' })
    semanas[0]!.insumos.push({ nome: 'Cobre', quantidade: 2, custo: 80 })
    semanas[0]!.maoDeObra.push({ descricao: 'Poda', pessoas: 2, diaria: 100, dias: 3 })
    semanas[1]!.mecanizacao.push({ descricao: 'Roço', horas: 4, custoHora: 150 })
    expect(totaisCiclo(semanas)).toEqual({
      insumos: 80,
      maoDeObra: 600,
      mecanizacao: 600,
      geral: 1280,
    })
  })
})
