/** Lembrete antigo de exportar o caderno: some depois de um backup. */
import { STORAGE_KEYS } from '@/data/constants'
import { removeStore } from '@/storage/localStore'

export function marcarCopiaFeita() {
  removeStore(STORAGE_KEYS.copiaPendente)
}
