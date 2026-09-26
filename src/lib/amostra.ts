/**
 * Caderno de exemplo (manga no Vale): catálogo, calda, insumos, diária e custos
 * espalhados nas fases da safra — para ver pizza e ciclo preenchidos.
 */
import { STORAGE_KEYS } from '@/data/constants'
import { calcularCalda } from '@/lib/calda'
import { palmerPadrao } from '@/lib/calendarioManga'
import { gerarSemanasCiclo } from '@/lib/ciclo'
import { calcularCustoCalda } from '@/lib/custoCalda'
import { createId } from '@/lib/id'
import { calcularRegulador } from '@/lib/regulador'
import { readStore, writeStore } from '@/storage/localStore'
import type {
  CatalogoCaderno,
  CicloCultura,
  ConfigProdutor,
  SemanaCiclo,
} from '@/types/models'

function id() {
  return createId()
}

export function amostraJaLancada() {
  return Boolean(readStore(STORAGE_KEYS.amostra) ?? localStorage.getItem(STORAGE_KEYS.amostra))
}

export function marcarAmostraLancada() {
  writeStore(STORAGE_KEYS.amostra, new Date().toISOString())
}

export function lancarItensDeTeste(atual: ConfigProdutor): ConfigProdutor {
  const produtor: ConfigProdutor = {
    cultura: atual.cultura ?? 'manga',
    areaHectares: atual.areaHectares || '12',
    dataReferencia: atual.dataReferencia || '2026-02-25',
    dataColheita: atual.dataColheita || '2026-12-15',
    nomeResponsavel: atual.nomeResponsavel,
    municipio: atual.municipio,
    talhoes: atual.talhoes || '4',
  }

  const ureia = id()
  const superfosfato = id()
  const cloreto = id()
  const oleo = id()
  const bordalesa = id()
  const enxofre = id()
  const silicato = id()

  const catalogo: CatalogoCaderno = {
    insumos: [
      { id: ureia, nome: 'Ureia', preco: '4,80', doseP: '0,08', doseM: '0,15', doseG: '0,25' },
      {
        id: superfosfato,
        nome: 'Superfosfato simples',
        preco: '3,20',
        doseP: '0,10',
        doseM: '0,20',
        doseG: '0,35',
      },
      {
        id: cloreto,
        nome: 'Cloreto de potássio',
        preco: '5,10',
        doseP: '0,05',
        doseM: '0,12',
        doseG: '0,22',
      },
      { id: oleo, nome: 'Óleo mineral', preco: '12,00', doseP: '0,02', doseM: '0,04', doseG: '0,06' },
    ],
    calda: [
      { id: bordalesa, nome: 'Calda bordalesa', dose: '10', unidade: 'ml/L' },
      { id: enxofre, nome: 'Enxofre molhável', dose: '5', unidade: 'g/L' },
      { id: silicato, nome: 'Silicato de potássio', dose: '8', unidade: 'ml/L' },
    ],
  }
  writeStore(STORAGE_KEYS.catalogo, catalogo)

  const caldaInsumos = catalogo.calda.map((item) => ({
    id: item.id,
    nome: item.nome,
    dose: item.dose,
    unidade: item.unidade,
  }))
  const resultadoCalda = calcularCalda({
    tanqueLitros: 2000,
    areaHectares: 12,
    litrosPorHectare: 400,
    tanqueParcial: true,
    insumos: catalogo.calda.map((item) => ({
      id: item.id,
      nome: item.nome,
      dose: Number(item.dose.replace(',', '.')),
      unidade: item.unidade,
    })),
  })
  writeStore(STORAGE_KEYS.calda, {
    tanqueLitros: '2000',
    areaHectares: '12',
    litrosPorHectare: '400',
    tanqueParcial: true,
    insumos: caldaInsumos,
    resultado: resultadoCalda,
  })

  const plantas = { P: 80, M: 120, G: 400 }
  const produtosInsumo = catalogo.insumos.map((item) => ({
    id: item.id,
    nome: item.nome,
    valor: item.preco,
    doseP: item.doseP,
    doseM: item.doseM,
    doseG: item.doseG,
  }))
  const linhasInsumo = catalogo.insumos.map((item) => {
    const preco = Number(item.preco.replace(',', '.'))
    const quantidade =
      plantas.P * Number(item.doseP.replace(',', '.')) +
      plantas.M * Number(item.doseM.replace(',', '.')) +
      plantas.G * Number(item.doseG.replace(',', '.'))
    return { nome: item.nome, quantidade, custo: quantidade * preco }
  })
  writeStore(STORAGE_KEYS.insumos, {
    P: String(plantas.P),
    M: String(plantas.M),
    G: String(plantas.G),
    produtos: produtosInsumo,
    resultado: linhasInsumo,
  })

  const atividades = [
    { id: id(), nome: 'Poda', trabalhadores: '8', valor: '80', tempo: '3', unidade: 'dias' as const },
    {
      id: id(),
      nome: 'Pulverização',
      trabalhadores: '4',
      valor: '90',
      tempo: '2',
      unidade: 'dias' as const,
    },
    { id: id(), nome: 'Capina', trabalhadores: '6', valor: '75', tempo: '4', unidade: 'dias' as const },
  ]
  const linhasMao = atividades.map((item) => ({
    nome: item.nome,
    custo:
      Number(item.trabalhadores) *
      Number(item.valor) *
      Number(item.tempo),
  }))
  writeStore(STORAGE_KEYS.maoDeObra, {
    atividades,
    resultado: linhasMao,
  })

  writeStore(STORAGE_KEYS.produtor, produtor)
  const geradas = gerarSemanasCiclo({
    dataInicio: produtor.dataReferencia,
    dataColheita: produtor.dataColheita,
    cultura: produtor.cultura,
  })
  const porSemana: Record<number, Partial<SemanaCiclo>> = {
    2: {
      insumos: [
        { nome: 'Ureia', quantidade: 40, custo: 192, origem: 'insumos' },
        { nome: 'Esterco curtido', quantidade: 1, custo: 480, origem: 'manual' },
      ],
      maoDeObra: [
        { descricao: 'Poda', pessoas: 8, diaria: 80, dias: 3, origem: 'mao-de-obra' },
      ],
      mecanizacao: [{ descricao: 'Triturador de galho', horas: 6, custoHora: 180 }],
    },
    5: {
      insumos: [
        { nome: 'Superfosfato simples', quantidade: 90, custo: 288, origem: 'insumos' },
        { nome: 'Cloreto de potássio', quantidade: 50, custo: 255, origem: 'insumos' },
      ],
      maoDeObra: [
        { descricao: 'Adubação', pessoas: 5, diaria: 80, dias: 2, origem: 'manual' },
      ],
      mecanizacao: [{ descricao: 'Distribuidor', horas: 4, custoHora: 150 }],
    },
    9: {
      insumos: linhasInsumo.map((linha) => ({
        nome: linha.nome,
        quantidade: linha.quantidade,
        custo: linha.custo,
        origem: 'insumos' as const,
      })),
      maoDeObra: linhasMao.map((linha) => ({
        descricao: linha.nome,
        pessoas: 1,
        diaria: linha.custo,
        dias: 1,
        origem: 'mao-de-obra' as const,
      })),
      mecanizacao: [{ descricao: 'Pulverizador', horas: 8, custoHora: 160 }],
    },
    14: {
      insumos: [{ nome: 'Óleo mineral', quantidade: 20, custo: 240, origem: 'insumos' }],
      maoDeObra: [
        { descricao: 'Desbrota', pessoas: 6, diaria: 80, dias: 2, origem: 'manual' },
      ],
    },
    19: {
      insumos: [
        { nome: 'Calda bordalesa', quantidade: 1, custo: 620, origem: 'manual' },
        { nome: 'Enxofre molhável', quantidade: 1, custo: 310, origem: 'manual' },
      ],
      maoDeObra: [
        { descricao: 'Pulverização', pessoas: 4, diaria: 90, dias: 2, origem: 'mao-de-obra' },
      ],
      mecanizacao: [{ descricao: 'Pulverizador', horas: 10, custoHora: 160 }],
    },
    25: {
      insumos: [{ nome: 'Adubo foliar', quantidade: 1, custo: 540, origem: 'manual' }],
      maoDeObra: [
        { descricao: 'Raleio', pessoas: 10, diaria: 85, dias: 3, origem: 'manual' },
      ],
    },
    32: {
      insumos: [{ nome: 'Silicato de potássio', quantidade: 1, custo: 430, origem: 'manual' }],
      mecanizacao: [{ descricao: 'Roçadeira', horas: 5, custoHora: 140 }],
    },
    38: {
      maoDeObra: [
        { descricao: 'Pré-colheita', pessoas: 8, diaria: 90, dias: 2, origem: 'manual' },
      ],
      mecanizacao: [{ descricao: 'Plataforma', horas: 4, custoHora: 200 }],
    },
    41: {
      maoDeObra: [
        { descricao: 'Colheita', pessoas: 16, diaria: 95, dias: 5, origem: 'mao-de-obra' },
      ],
      mecanizacao: [{ descricao: 'Caminhão', horas: 12, custoHora: 220 }],
    },
  }

  const semanas = geradas.map((semana) => {
    const extra = porSemana[semana.numero]
    if (!extra) return semana
    return {
      ...semana,
      insumos: extra.insumos ?? [],
      maoDeObra: extra.maoDeObra ?? [],
      mecanizacao: extra.mecanizacao ?? [],
    }
  })

  writeStore<CicloCultura>(STORAGE_KEYS.ciclo, {
    id: 'ciclo-amostra',
    cultura: produtor.cultura,
    dataInicio: produtor.dataReferencia,
    dataColheita: produtor.dataColheita,
    semanas,
    atualizadoEm: new Date().toISOString(),
  })
  writeStore(STORAGE_KEYS.produtor, produtor)

  const insumosCusto = [
    { id: id(), nome: 'Esterco', qtd: 150, valorUnit: 0.32 },
    { id: id(), nome: 'Farinha de ossos', qtd: 10, valorUnit: 1 },
    { id: id(), nome: 'Torta de mamona', qtd: 100, valorUnit: 2 },
    { id: id(), nome: 'Cinzas', qtd: 50, valorUnit: 1.2 },
    { id: id(), nome: 'Pó de rocha', qtd: 100, valorUnit: 0.54 },
  ]
  writeStore(STORAGE_KEYS.custoCalda, {
    tankVolume: '10000',
    volPerHa: '200',
    numApps: '40',
    insumos: insumosCusto.map((item) => ({
      id: item.id,
      nome: item.nome,
      qtd: String(item.qtd).replace('.', ','),
      valorUnit: String(item.valorUnit).replace('.', ','),
    })),
    resultado: calcularCustoCalda({
      tankVolume: 10000,
      volPerHa: 200,
      numApps: 40,
      insumos: insumosCusto,
    }),
  })

  const insumosRegulador = [
    {
      id: id(),
      nome: 'Paclo BR',
      dosMaior: 30,
      dosMedia: 25,
      dosMenor: 20,
      valorUnit: 48,
    },
    {
      id: id(),
      nome: 'Ácido fúlvico',
      dosMaior: 20,
      dosMedia: 20,
      dosMenor: 20,
      valorUnit: 9.9,
    },
  ]
  writeStore(STORAGE_KEYS.regulador, {
    areaHa: '12',
    plantasMaior: '400',
    plantasMedia: '120',
    plantasMenor: '80',
    insumos: insumosRegulador.map((item) => ({
      id: item.id,
      nome: item.nome,
      dosMaior: String(item.dosMaior),
      dosMedia: String(item.dosMedia),
      dosMenor: String(item.dosMenor),
      valorUnit: String(item.valorUnit).replace('.', ','),
    })),
    resultado: calcularRegulador({
      areaHa: 12,
      plantasMaior: 400,
      plantasMedia: 120,
      plantasMenor: 80,
      insumos: insumosRegulador,
    }),
  })

  const palmer = palmerPadrao()
  writeStore(STORAGE_KEYS.calendario, {
    dataAlvo: produtor.dataColheita,
    variedades: [palmer],
    selecionadaId: palmer.id,
  })

  marcarAmostraLancada()
  return produtor
}
