/** Carrega jsPDF só quando o produtor pede o arquivo. */
import type { ResultadoCalda } from '@/lib/calda'
import type { VariedadeManga } from '@/lib/calendarioManga'
import type { ConfigProdutor, Propriedade, SemanaCiclo, TotaisCiclo } from '@/types/models'

export async function exportarCaldaPdf(
  resultado: ResultadoCalda,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const { exportarCaldaPdf: run } = await import('@/lib/pdf')
  run(resultado, propriedade, produtor)
}

export async function exportarInsumosPdf(
  linhas: Array<{ nome: string; quantidade: number; custo: number }>,
  total: number,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const { exportarInsumosPdf: run } = await import('@/lib/pdf')
  run(linhas, total, propriedade, produtor)
}

export async function exportarMaoDeObraPdf(
  linhas: Array<{ nome: string; custo: number }>,
  total: number,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const { exportarMaoDeObraPdf: run } = await import('@/lib/pdf')
  run(linhas, total, propriedade, produtor)
}

export async function exportarCicloPdf(
  semanas: SemanaCiclo[],
  totais: TotaisCiclo,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const { exportarCicloPdf: run } = await import('@/lib/pdf')
  run(semanas, totais, propriedade, produtor)
}

export async function exportarCalendarioPdf(
  variedade: VariedadeManga,
  dataAlvo: string,
  datas: Date[] | null,
  custos: {
    entries: { nome: string; etapa: string; offset: number; rTotal: number }[]
    total: number
    porPlanta: number
    porHa: number
  },
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const { exportarCalendarioPdf: run } = await import('@/lib/pdf')
  run(variedade, dataAlvo, datas, custos, propriedade, produtor)
}
