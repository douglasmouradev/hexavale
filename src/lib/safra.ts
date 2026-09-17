/**
 * Fecha a safra atual: guarda as 42 semanas e zera o ciclo para a próxima.
 * As datas em Produtor precisam ser preenchidas de novo.
 */
import { STORAGE_KEYS } from '@/data/constants'
import { semanasDoProdutor } from '@/lib/caderno'
import { totaisCiclo } from '@/lib/ciclo'
import { createId } from '@/lib/id'
import { readStore, removeStore, writeStore } from '@/storage/localStore'
import type { ConfigProdutor, SafraArquivada } from '@/types/models'

export function lerSafras(): SafraArquivada[] {
  const lista = readStore<SafraArquivada[]>(STORAGE_KEYS.safras)
  return Array.isArray(lista) ? lista : []
}

export type FecharSafraResult =
  | { ok: true; safra: SafraArquivada }
  | { ok: false; reason: 'sem-data' }

export function fecharSafraAtual(produtor: ConfigProdutor): FecharSafraResult {
  const semanas = semanasDoProdutor(produtor)
  if (!semanas.length) return { ok: false, reason: 'sem-data' }

  const safra: SafraArquivada = {
    id: createId(),
    cultura: produtor.cultura,
    dataInicio: produtor.dataReferencia,
    dataColheita: produtor.dataColheita,
    fechadaEm: new Date().toISOString(),
    totais: totaisCiclo(semanas),
    semanas,
  }
  writeStore(STORAGE_KEYS.safras, [safra, ...lerSafras()])
  removeStore(STORAGE_KEYS.ciclo)
  return { ok: true, safra }
}

/** Depois de fechar, a próxima colheita precisa de datas novas. */
export function produtorAposFechar(produtor: ConfigProdutor): ConfigProdutor {
  return {
    ...produtor,
    dataReferencia: null,
    dataColheita: null,
  }
}
