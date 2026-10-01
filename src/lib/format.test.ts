import { describe, expect, it } from 'vitest'
import { formatCurrency, formatMilhar, parseDecimal } from '@/lib/format'

describe('formatMilhar', () => {
  it('põe ponto de milhar e volta a ler o mesmo número', () => {
    expect(formatMilhar('1000')).toBe('1.000')
    expect(formatMilhar('1.0000')).toBe('10.000')
    expect(formatMilhar('1234567')).toBe('1.234.567')
    expect(formatMilhar('500')).toBe('500')
    expect(formatMilhar('')).toBe('')
    expect(parseDecimal(formatMilhar('10000'))).toBe(10000)
  })
})

describe('parseDecimal', () => {
  it('lê vírgula decimal e ponto de milhar', () => {
    expect(parseDecimal('1,5')).toBe(1.5)
    expect(parseDecimal('2.000')).toBe(2000)
    expect(parseDecimal('2.000,50')).toBe(2000.5)
    expect(parseDecimal('2000,5')).toBe(2000.5)
  })

  it('mantém decimal com ponto quando não é milhar', () => {
    expect(parseDecimal('0.32')).toBe(0.32)
    expect(parseDecimal('1.5')).toBe(1.5)
    expect(parseDecimal('12.50')).toBe(12.5)
  })

  it('ignora vazio e texto', () => {
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('abc')).toBeNull()
  })
})

describe('formatCurrency', () => {
  it('mostra 3 casas quando o litro fica abaixo de 5 centavos', () => {
    expect(formatCurrency(0.021)).toContain('0,021')
    expect(formatCurrency(4.2)).toContain('4,20')
  })
})
