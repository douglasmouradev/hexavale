/** Carrega jsPDF só quando o produtor pede o arquivo. */
import type { VariedadeManga } from '@/lib/calendarioManga'
import type { ConfigProdutor, Propriedade } from '@/types/models'

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
