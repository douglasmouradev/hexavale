/**
 * Receita de calda: volume da área, tanques e quantidade de cada insumo.
 * ml/L e g/L usam o volume a preparar; unidades por ha usam a área.
 */
import { formatNumber, parseDecimal } from '@/lib/format'
import type { Insumo, UnidadeDose } from '@/types/models'

export const UNIDADES_DOSE: { value: UnidadeDose; label: string; hint: string }[] = [
  { value: 'ml/L', label: 'ml/L', hint: 'por litro de calda' },
  { value: 'g/L', label: 'g/L', hint: 'por litro de calda' },
  { value: 'ml/ha', label: 'ml/ha', hint: 'por hectare' },
  { value: 'g/ha', label: 'g/ha', hint: 'por hectare' },
  { value: 'L/ha', label: 'L/ha', hint: 'por hectare' },
  { value: 'kg/ha', label: 'kg/ha', hint: 'por hectare' },
]

export interface InsumoCalculado {
  id: string
  nome: string
  dose: number
  unidade: UnidadeDose
  quantidadeTotal: number
  unidadeTotal: string
  valorRanking: number
}

export interface ResultadoCalda {
  tanqueLitros: number
  areaHectares: number
  litrosPorHectare: number
  volumeAreaLitros: number
  tanquesNecessarios: number
  volumePrepararLitros: number
  ultimoTanqueLitros: number
  tanqueParcial: boolean
  insumos: InsumoCalculado[]
}

function toDisplay(quantidade: number, unidadeBase: 'ml' | 'g' | 'L' | 'kg') {
  if (unidadeBase === 'ml' && quantidade >= 1000) {
    return { quantidadeTotal: quantidade / 1000, unidadeTotal: 'L', valorRanking: quantidade / 1000 }
  }
  if (unidadeBase === 'g' && quantidade >= 1000) {
    return { quantidadeTotal: quantidade / 1000, unidadeTotal: 'kg', valorRanking: quantidade / 1000 }
  }
  if (unidadeBase === 'L') {
    return { quantidadeTotal: quantidade, unidadeTotal: 'L', valorRanking: quantidade }
  }
  if (unidadeBase === 'kg') {
    return { quantidadeTotal: quantidade, unidadeTotal: 'kg', valorRanking: quantidade }
  }
  return {
    quantidadeTotal: quantidade,
    unidadeTotal: unidadeBase,
    valorRanking: quantidade / 1000,
  }
}

function quantidadeInsumo(
  insumo: Pick<Insumo, 'dose' | 'unidade'>,
  volumePrepararLitros: number,
  areaHectares: number,
) {
  switch (insumo.unidade) {
    case 'ml/L':
      return toDisplay(insumo.dose * volumePrepararLitros, 'ml')
    case 'g/L':
      return toDisplay(insumo.dose * volumePrepararLitros, 'g')
    case 'ml/ha':
      return toDisplay(insumo.dose * areaHectares, 'ml')
    case 'g/ha':
      return toDisplay(insumo.dose * areaHectares, 'g')
    case 'L/ha':
      return toDisplay(insumo.dose * areaHectares, 'L')
    case 'kg/ha':
      return toDisplay(insumo.dose * areaHectares, 'kg')
  }
}

export function calcularCalda(input: {
  tanqueLitros: number
  areaHectares: number
  litrosPorHectare: number
  insumos: Insumo[]
  tanqueParcial: boolean
}): ResultadoCalda {
  const volumeAreaLitros = input.areaHectares * input.litrosPorHectare
  const tanquesNecessarios = Math.max(
    1,
    Math.ceil(volumeAreaLitros / input.tanqueLitros),
  )
  const resto = volumeAreaLitros % input.tanqueLitros
  const ultimoTanqueLitros = resto === 0 ? input.tanqueLitros : resto
  const volumePrepararLitros = input.tanqueParcial
    ? volumeAreaLitros
    : tanquesNecessarios * input.tanqueLitros

  const insumos = input.insumos
    .map((insumo) => ({
      id: insumo.id,
      nome: insumo.nome,
      dose: insumo.dose,
      unidade: insumo.unidade,
      ...quantidadeInsumo(insumo, volumePrepararLitros, input.areaHectares),
    }))
    .sort((a, b) => b.valorRanking - a.valorRanking)

  return {
    tanqueLitros: input.tanqueLitros,
    areaHectares: input.areaHectares,
    litrosPorHectare: input.litrosPorHectare,
    volumeAreaLitros,
    tanquesNecessarios,
    volumePrepararLitros,
    ultimoTanqueLitros,
    tanqueParcial: input.tanqueParcial,
    insumos,
  }
}

export function formatQuantidade(quantidade: number, unidade: string) {
  return `${formatNumber(quantidade, 3)} ${unidade}`
}

export function parseCaldaCampos(input: {
  tanqueLitros: string
  areaHectares: string
  litrosPorHectare: string
}):
  | { error: string }
  | { tanqueLitros: number; areaHectares: number; litrosPorHectare: number } {
  const tanqueLitros = parseDecimal(input.tanqueLitros)
  const areaHectares = parseDecimal(input.areaHectares)
  const litrosPorHectare = parseDecimal(input.litrosPorHectare)

  if (tanqueLitros === null || tanqueLitros <= 0) {
    return { error: 'Informe o tanque em litros.' }
  }
  if (areaHectares === null || areaHectares <= 0) {
    return { error: 'Informe a área em hectares.' }
  }
  if (litrosPorHectare === null || litrosPorHectare <= 0) {
    return { error: 'Informe os litros por hectare.' }
  }

  return { tanqueLitros, areaHectares, litrosPorHectare }
}
