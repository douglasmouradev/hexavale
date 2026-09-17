import { addDays, formatISO, parseISO, startOfDay } from 'date-fns'
import { CICLO_SEMANAS } from '@/data/constants'
import { sugestaoSemana } from '@/data/fenologia'
import type { Cultura, SemanaCiclo, TotaisCiclo } from '@/types/models'

function toIsoDate(date: Date): string {
  return formatISO(date, { representation: 'date' })
}

export function gerarSemanasCiclo(opts: {
  dataColheita?: string | null
  dataInicio?: string | null
  cultura?: Cultura | null
}): SemanaCiclo[] {
  if (opts.dataColheita) {
    const colheita = startOfDay(parseISO(opts.dataColheita))
    const inicio = addDays(colheita, -(CICLO_SEMANAS * 7 - 1))
    return montarSemanas(inicio, opts.cultura)
  }

  if (opts.dataInicio) {
    return montarSemanas(startOfDay(parseISO(opts.dataInicio)), opts.cultura)
  }

  return []
}

function montarSemanas(inicio: Date, cultura?: Cultura | null): SemanaCiclo[] {
  return Array.from({ length: CICLO_SEMANAS }, (_, index) => {
    const numero = index + 1
    const dataInicio = addDays(inicio, index * 7)
    const dataFim = addDays(dataInicio, 6)
    return {
      numero,
      dataInicio: toIsoDate(dataInicio),
      dataFim: toIsoDate(dataFim),
      tipoTrabalho: sugestaoSemana(cultura ?? null, numero),
      insumos: [],
      maoDeObra: [],
      mecanizacao: [],
    }
  })
}

export function mesclarSemanas(
  atuais: SemanaCiclo[],
  anteriores: SemanaCiclo[],
): SemanaCiclo[] {
  const mapa = new Map(anteriores.map((semana) => [semana.numero, semana]))
  return atuais.map((semana) => {
    const antiga = mapa.get(semana.numero)
    if (!antiga) return semana
    return {
      ...semana,
      tipoTrabalho: antiga.tipoTrabalho || semana.tipoTrabalho,
      insumos: antiga.insumos,
      maoDeObra: antiga.maoDeObra,
      mecanizacao: antiga.mecanizacao,
    }
  })
}

export function semanaHoje(semanas: SemanaCiclo[]): SemanaCiclo | null {
  const hoje = toIsoDate(new Date())
  return (
    semanas.find(
      (semana) => semana.dataInicio <= hoje && semana.dataFim >= hoje,
    ) ?? null
  )
}

export function totalSemana(semana: SemanaCiclo): number {
  const insumos = semana.insumos.reduce((sum, item) => sum + item.custo, 0)
  const maoDeObra = semana.maoDeObra.reduce(
    (sum, item) => sum + item.pessoas * item.diaria * item.dias,
    0,
  )
  const mecanizacao = semana.mecanizacao.reduce(
    (sum, item) => sum + item.horas * item.custoHora,
    0,
  )
  return insumos + maoDeObra + mecanizacao
}

export function totaisCiclo(semanas: SemanaCiclo[]): TotaisCiclo {
  return semanas.reduce<TotaisCiclo>(
    (acc, semana) => {
      const insumos = semana.insumos.reduce((sum, item) => sum + item.custo, 0)
      const maoDeObra = semana.maoDeObra.reduce(
        (sum, item) => sum + item.pessoas * item.diaria * item.dias,
        0,
      )
      const mecanizacao = semana.mecanizacao.reduce(
        (sum, item) => sum + item.horas * item.custoHora,
        0,
      )
      acc.insumos += insumos
      acc.maoDeObra += maoDeObra
      acc.mecanizacao += mecanizacao
      acc.geral += insumos + maoDeObra + mecanizacao
      return acc
    },
    { insumos: 0, maoDeObra: 0, mecanizacao: 0, geral: 0 },
  )
}
