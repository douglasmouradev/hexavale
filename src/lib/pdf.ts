/** PDF do calendário gerado no aparelho. O arquivo só sai se o produtor exportar. */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { culturaLabel } from '@/data/modules'
import { formatCurrency, formatNumber } from '@/lib/format'
import { formatBrUtc, type VariedadeManga } from '@/lib/calendarioManga'
import type { ConfigProdutor, Propriedade } from '@/types/models'

function lastTableY(doc: jsPDF) {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 70
}

function header(
  doc: jsPDF,
  titulo: string,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  doc.setFillColor(31, 107, 58)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(247, 243, 232)
  doc.setFontSize(16)
  doc.text('Hexavale', 14, 12)
  doc.setFontSize(11)
  doc.text(titulo, 14, 21)

  doc.setTextColor(26, 23, 20)
  doc.setFontSize(10)
  const linhas = [
    `Propriedade: ${propriedade?.nome ?? '-'}`,
    `Telefone: ${propriedade?.telefone ?? '-'}`,
    `Cultura: ${culturaLabel(produtor.cultura)}`,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
  ]
  linhas.forEach((linha, index) => {
    doc.text(linha, 14, 38 + index * 6)
  })
}

export function exportarCalendarioPdf(
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
  const doc = new jsPDF()
  header(doc, `Calendario da mangueira - ${variedade.name}`, propriedade, produtor)
  autoTable(doc, {
    startY: 64,
    theme: 'plain',
    body: [
      ['Variedade', variedade.name],
      ['Talhao', variedade.talhao.nome || '-'],
      ['Plantas', String(variedade.talhao.nPlantas)],
      ['Area (ha)', String(variedade.talhao.areaHa)],
      ['Colheita alvo', dataAlvo || '-'],
    ],
  })
  if (datas?.length) {
    autoTable(doc, {
      startY: lastTableY(doc) + 8,
      head: [['Etapa', 'Data', 'Dias do intervalo']],
      body: variedade.stages.map((etapa, index) => [
        etapa.name,
        datas[index] ? formatBrUtc(datas[index]!) : '-',
        etapa.days ? String(etapa.days) : 'partida',
      ]),
      headStyles: { fillColor: [31, 107, 58], textColor: 255 },
    })
  }
  if (custos.entries.length) {
    autoTable(doc, {
      startY: lastTableY(doc) + 8,
      head: [['Operacao', 'Intervalo', 'Dia', 'Custo', '%']],
      body: [
        ...custos.entries.map((item) => [
          item.nome,
          item.etapa,
          String(item.offset),
          formatCurrency(item.rTotal),
          `${formatNumber(
            'pct' in item && typeof item.pct === 'number'
              ? item.pct
              : custos.total > 0
                ? (item.rTotal / custos.total) * 100
                : 0,
            1,
          )}%`,
        ]),
        ['Total', '', '', formatCurrency(custos.total), '100%'],
        ['Por planta', '', '', formatCurrency(custos.porPlanta), ''],
        ['Por hectare', '', '', formatCurrency(custos.porHa), ''],
      ],
      headStyles: { fillColor: [31, 107, 58], textColor: 255 },
      styles: { fontSize: 8 },
    })
  }
  doc.save(`calendario-manga-${new Date().toISOString().slice(0, 10)}.pdf`)
}
