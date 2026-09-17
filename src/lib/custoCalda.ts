/**
 * Receita do tanque em kg e R$: custo do litro e do hectare no ciclo.
 * Complementa a tela Calda (que monta volume e dose).
 */
import { parseDecimal } from '@/lib/format'

export interface InsumoCustoCalda {
  id: string
  nome: string
  qtd: number
  valorUnit: number
}

export interface ResultadoCustoCalda {
  totalValor: number
  totalQtd: number
  valorLitro: number
  volumeCiclo: number
  valorOperacaoHa: number
  tankVolume: number
  volPerHa: number
  numApps: number
  maiorCusto: { nome: string; valor: number; pct: number } | null
  maiorVolume: { nome: string; qtd: number } | null
}

export function calcularCustoCalda(input: {
  tankVolume: number
  volPerHa: number
  numApps: number
  insumos: InsumoCustoCalda[]
}): ResultadoCustoCalda {
  const validos = input.insumos.filter((item) => item.nome.trim() && (item.qtd > 0 || item.valorUnit > 0))
  const totalValor = validos.reduce((sum, item) => sum + item.qtd * item.valorUnit, 0)
  const totalQtd = validos.reduce((sum, item) => sum + item.qtd, 0)
  const valorLitro = input.tankVolume > 0 ? totalValor / input.tankVolume : 0
  const volumeCiclo = input.volPerHa * input.numApps
  const valorOperacaoHa = valorLitro * volumeCiclo

  let maiorCusto: ResultadoCustoCalda['maiorCusto'] = null
  let maiorVolume: ResultadoCustoCalda['maiorVolume'] = null
  for (const item of validos) {
    const valor = item.qtd * item.valorUnit
    if (!maiorCusto || valor > maiorCusto.valor) {
      maiorCusto = {
        nome: item.nome,
        valor,
        pct: totalValor > 0 ? (valor / totalValor) * 100 : 0,
      }
    }
    if (!maiorVolume || item.qtd > maiorVolume.qtd) {
      maiorVolume = { nome: item.nome, qtd: item.qtd }
    }
  }

  return {
    totalValor,
    totalQtd,
    valorLitro,
    volumeCiclo,
    valorOperacaoHa,
    tankVolume: input.tankVolume,
    volPerHa: input.volPerHa,
    numApps: input.numApps,
    maiorCusto,
    maiorVolume,
  }
}

export function parseCustoCaldaCampos(input: {
  tankVolume: string
  volPerHa: string
  numApps: string
}):
  | { error: string }
  | { tankVolume: number; volPerHa: number; numApps: number } {
  const tankVolume = parseDecimal(input.tankVolume)
  const volPerHa = parseDecimal(input.volPerHa)
  const numApps = parseDecimal(input.numApps)
  if (tankVolume === null || tankVolume <= 0) return { error: 'Informe o volume do tanque.' }
  if (volPerHa === null || volPerHa <= 0) return { error: 'Informe os litros por hectare.' }
  if (numApps === null || numApps <= 0) return { error: 'Informe o número de aplicações.' }
  return { tankVolume, volPerHa, numApps }
}
