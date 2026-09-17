/** Lembra de exportar o caderno depois de lançar custo neste aparelho. */
import { STORAGE_KEYS } from '@/data/constants'
import { readStore, removeStore, writeStore } from '@/storage/localStore'

export function marcarCopiaPendente() {
  writeStore(STORAGE_KEYS.copiaPendente, { em: new Date().toISOString() })
}

export function marcarCopiaFeita() {
  removeStore(STORAGE_KEYS.copiaPendente)
}

export function temCopiaPendente() {
  return Boolean(readStore(STORAGE_KEYS.copiaPendente))
}
