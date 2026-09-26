/** PDFs gerados no aparelho (calda, insumos, diária, ciclo). O arquivo só sai se o produtor exportar. */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { culturaLabel } from '@/data/modules'
import { formatCurrency, formatNumber } from '@/lib/format'
import { totalSemana } from '@/lib/ciclo'
import { formatBrUtc, type VariedadeManga } from '@/lib/calendarioManga'
import type { ResultadoCalda } from '@/lib/calda'
import type { ConfigProdutor, Propriedade, SemanaCiclo, TotaisCiclo } from '@/types/models'

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

export function exportarCaldaPdf(
  resultado: ResultadoCalda,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const doc = new jsPDF()
  header(doc, 'Relatorio de Calda Organica', propriedade, produtor)

  autoTable(doc, {
    startY: 64,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    body: [
      ['Tanque', `${formatNumber(resultado.tanqueLitros)} L`],
      ['Area', `${formatNumber(resultado.areaHectares)} ha`],
      ['Aplicacao', `${formatNumber(resultado.litrosPorHectare)} L/ha`],
      ['Volume da area', `${formatNumber(resultado.volumeAreaLitros)} L`],
      ['Tanques necessarios', String(resultado.tanquesNecessarios)],
      ['Volume a preparar', `${formatNumber(resultado.volumePrepararLitros)} L`],
    ],
  })

  autoTable(doc, {
    startY: lastTableY(doc) + 8,
    head: [['Insumo', 'Dose', 'Unidade', 'Quantidade total']],
    body: resultado.insumos.map((insumo) => [
      insumo.nome,
      formatNumber(insumo.dose, 3),
      insumo.unidade,
      `${formatNumber(insumo.quantidadeTotal, 3)} ${insumo.unidadeTotal}`,
    ]),
    headStyles: { fillColor: [31, 107, 58], textColor: 255 },
    styles: { fontSize: 10 },
  })

  const afterTable = lastTableY(doc) + 16
  doc.setFontSize(12)
  doc.text('Ranking de consumo', 14, afterTable)

  const max = Math.max(...resultado.insumos.map((item) => item.valorRanking), 0.001)
  let y = afterTable + 10
  resultado.insumos.forEach((insumo, index) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    const width = (insumo.valorRanking / max) * 120
    doc.setFontSize(9)
    doc.setTextColor(26, 23, 20)
    doc.text(
      `${insumo.nome} (${formatNumber(insumo.quantidadeTotal, 3)} ${insumo.unidadeTotal})`,
      14,
      y,
    )
    doc.setFillColor(index === 0 ? 232 : 31, index === 0 ? 137 : 107, index === 0 ? 44 : 58)
    doc.rect(14, y + 2, Math.max(width, 4), 6, 'F')
    y += 16
  })

  const arquivo = `calda-organica-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(arquivo)
}

export function exportarInsumosPdf(
  linhas: Array<{ nome: string; quantidade: number; custo: number }>,
  total: number,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const doc = new jsPDF()
  header(doc, 'Levantamento de insumos', propriedade, produtor)
  autoTable(doc, {
    startY: 64,
    head: [['Produto', 'Quantidade', 'Custo']],
    body: [
      ...linhas.map((linha) => [
        linha.nome,
        formatNumber(linha.quantidade, 2),
        formatCurrency(linha.custo),
      ]),
      ['Total', '', formatCurrency(total)],
    ],
    headStyles: { fillColor: [31, 107, 58], textColor: 255 },
  })
  doc.save(`insumos-${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function exportarMaoDeObraPdf(
  linhas: Array<{ nome: string; custo: number }>,
  total: number,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const doc = new jsPDF()
  header(doc, 'Mao de obra', propriedade, produtor)
  autoTable(doc, {
    startY: 64,
    head: [['Atividade', 'Custo']],
    body: [
      ...linhas.map((linha) => [linha.nome, formatCurrency(linha.custo)]),
      ['Total', formatCurrency(total)],
    ],
    headStyles: { fillColor: [31, 107, 58], textColor: 255 },
  })
  doc.save(`mao-de-obra-${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function exportarCicloPdf(
  semanas: SemanaCiclo[],
  totais: TotaisCiclo,
  propriedade: Propriedade | null,
  produtor: ConfigProdutor,
) {
  const doc = new jsPDF()
  header(doc, 'Ciclo da cultura - 42 semanas', propriedade, produtor)
  autoTable(doc, {
    startY: 64,
    head: [['Semana', 'Periodo', 'Trabalho', 'Parcial']],
    body: semanas.map((semana) => [
      String(semana.numero),
      `${semana.dataInicio} a ${semana.dataFim}`,
      semana.tipoTrabalho,
      formatCurrency(totalSemana(semana)),
    ]),
    headStyles: { fillColor: [31, 107, 58], textColor: 255 },
    styles: { fontSize: 8 },
  })
  autoTable(doc, {
    startY: lastTableY(doc) + 8,
    body: [
      ['Insumos', formatCurrency(totais.insumos)],
      ['Mao de obra', formatCurrency(totais.maoDeObra)],
      ['Maquinas', formatCurrency(totais.mecanizacao)],
      ['Total do ciclo', formatCurrency(totais.geral)],
    ],
  })
  doc.save(`ciclo-${new Date().toISOString().slice(0, 10)}.pdf`)
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
