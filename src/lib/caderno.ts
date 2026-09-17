/**
 * Caderno único: custos de Insumos e Diária entram na semana atual do ciclo.
 * Relançar na mesma origem substitui as linhas anteriores, sem duplicar.
 */
import { STORAGE_KEYS } from '@/data/constants'
import {
  gerarSemanasCiclo,
  mesclarSemanas,
  semanaHoje,
  hojeIso,
} from '@/lib/ciclo'
import { readStore, writeStore } from '@/storage/localStore'
import type {
  CicloCultura,
  ConfigProdutor,
  InsumoSemana,
  MaoDeObraSemana,
  SemanaCiclo,
} from '@/types/models'

export type LancamentoOk = {
  ok: true
  semana: number
  trabalho: string
}

export type LancamentoErro = {
  ok: false
  reason: 'sem-data' | 'vazio'
}

export type LancamentoResult = LancamentoOk | LancamentoErro

/** Junta o calendário gerado pelas datas do Produtor com o que já foi lançado. */
export function semanasDoProdutor(produtor: ConfigProdutor): SemanaCiclo[] {
  const geradas = gerarSemanasCiclo({
    dataColheita: produtor.dataColheita,
    dataInicio: produtor.dataReferencia,
    cultura: produtor.cultura,
  })
  if (!geradas.length) return []
  const salvo = readStore<CicloCultura>(STORAGE_KEYS.ciclo)
  return mesclarSemanas(geradas, salvo?.semanas ?? [])
}

function persistir(produtor: ConfigProdutor, semanas: SemanaCiclo[]) {
  const anterior = readStore<CicloCultura>(STORAGE_KEYS.ciclo)
  writeStore<CicloCultura>(STORAGE_KEYS.ciclo, {
    id: anterior?.id ?? 'ciclo-atual',
    cultura: produtor.cultura,
    dataInicio: produtor.dataReferencia,
    dataColheita: produtor.dataColheita,
    semanas,
    atualizadoEm: new Date().toISOString(),
  })
}

/** Semana de hoje; se estiver fora das 42, usa a primeira ou a última. */
export function semanaAlvo(semanas: SemanaCiclo[]): SemanaCiclo | null {
  if (!semanas.length) return null
  const hoje = semanaHoje(semanas)
  if (hoje) return hoje
  const iso = hojeIso()
  if (iso < semanas[0].dataInicio) return semanas[0]
  return semanas[semanas.length - 1]
}

export function lancarInsumosNoCiclo(
  produtor: ConfigProdutor,
  linhas: Array<{ nome: string; quantidade: number; custo: number }>,
): LancamentoResult {
  const semanas = semanasDoProdutor(produtor)
  const alvo = semanaAlvo(semanas)
  if (!alvo) return { ok: false, reason: 'sem-data' }

  const extras: InsumoSemana[] = linhas
    .filter((linha) => linha.custo > 0)
    .map((linha) => ({
      nome: linha.nome,
      quantidade: linha.quantidade,
      custo: linha.custo,
      origem: 'insumos',
    }))
  if (!extras.length) return { ok: false, reason: 'vazio' }

  persistir(
    produtor,
    semanas.map((semana) =>
      semana.numero === alvo.numero
        ? {
            ...semana,
            insumos: [
              ...semana.insumos.filter((item) => item.origem !== 'insumos'),
              ...extras,
            ],
          }
        : semana,
    ),
  )
  return { ok: true, semana: alvo.numero, trabalho: alvo.tipoTrabalho }
}

export function lancarMaoDeObraNoCiclo(
  produtor: ConfigProdutor,
  linhas: Array<{ nome: string; custo: number }>,
): LancamentoResult {
  const semanas = semanasDoProdutor(produtor)
  const alvo = semanaAlvo(semanas)
  if (!alvo) return { ok: false, reason: 'sem-data' }

  const extras: MaoDeObraSemana[] = linhas
    .filter((linha) => linha.custo > 0)
    .map((linha) => ({
      descricao: linha.nome,
      pessoas: 1,
      diaria: linha.custo,
      dias: 1,
      origem: 'mao-de-obra',
    }))
  if (!extras.length) return { ok: false, reason: 'vazio' }

  persistir(
    produtor,
    semanas.map((semana) =>
      semana.numero === alvo.numero
        ? {
            ...semana,
            maoDeObra: [
              ...semana.maoDeObra.filter((item) => item.origem !== 'mao-de-obra'),
              ...extras,
            ],
          }
        : semana,
    ),
  )
  return { ok: true, semana: alvo.numero, trabalho: alvo.tipoTrabalho }
}

export function mensagemLancamento(result: LancamentoResult) {
  if (!result.ok) {
    return result.reason === 'vazio'
      ? 'Não há custo para lançar.'
      : 'Defina a data do ciclo em Produtor para lançar o custo.'
  }
  return `Lançado na semana ${result.semana} · ${result.trabalho}`
}
