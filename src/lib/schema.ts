/**
 * Versão do caderno neste aparelho. Sobe quando o formato gravado muda
 * (ex.: calendário compacto) para regravar dados antigos uma vez.
 */
import { STORAGE_KEYS } from '@/data/constants'
import { readStore, writeStore } from '@/storage/localStore'

export const SCHEMA_VERSAO = 2

export function migrarCaderno() {
  const atual = readStore<number>(STORAGE_KEYS.schema) ?? 1
  if (atual >= SCHEMA_VERSAO) return
  const calendario = readStore(STORAGE_KEYS.calendario)
  if (calendario) writeStore(STORAGE_KEYS.calendario, calendario)
  writeStore(STORAGE_KEYS.schema, SCHEMA_VERSAO)
}
