/**
 * Regulador de crescimento: dose em mL/planta por porte → volume em L e custo.
 */
import { parseDecimal } from '@/lib/format'

export interface InsumoRegulador {
  id: string
  nome: string
  dosMaior: number
  dosMedia: number
  dosMenor: number
  valorUnit: number
}

export function volumeLitros(doseMl: number, plantas: number) {
  return (doseMl * plantas) / 1000
}

export function calcularRegulador(input: {
  areaHa: number
  plantasMaior: number
  plantasMedia: number
  plantasMenor: number
  insumos: InsumoRegulador[]
}) {
  const totalPlantas = input.plantasMaior + input.plantasMedia + input.plantasMenor
  const itens = input.insumos
    .filter((item) => item.nome.trim())
    .map((item) => {
      const vMaior = volumeLitros(item.dosMaior, input.plantasMaior)
      const vMedia = volumeLitros(item.dosMedia, input.plantasMedia)
      const vMenor = volumeLitros(item.dosMenor, input.plantasMenor)
      const volume = vMaior + vMedia + vMenor
      return {
        id: item.id,
        nome: item.nome,
        volume,
        custo: volume * item.valorUnit,
      }
    })
  const volumeTotal = itens.reduce((sum, item) => sum + item.volume, 0)
  const custoTotal = itens.reduce((sum, item) => sum + item.custo, 0)
  const custoHa = input.areaHa > 0 ? custoTotal / input.areaHa : 0
  const maior = itens.reduce<(typeof itens)[number] | null>(
    (atual, item) => (!atual || item.custo > atual.custo ? item : atual),
    null,
  )
  return { totalPlantas, itens, volumeTotal, custoTotal, custoHa, maior }
}

export function parsePlantas(value: string) {
  const n = parseDecimal(value)
  return n === null || n < 0 ? 0 : n
}
