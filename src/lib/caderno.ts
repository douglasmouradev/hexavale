/** Leitura do caderno antigo: plantas P+M+G que o produtor já tinha lançado. */
import { STORAGE_KEYS } from '@/data/constants'
import { parseDecimal } from '@/lib/format'
import { readStore } from '@/storage/localStore'

/** Soma plantas P+M+G lançadas em Insumos, se houver. */
export function contarPlantasInsumos(): number | null {
  const dados = readStore<{ P?: string; M?: string; G?: string }>(STORAGE_KEYS.insumos)
  if (!dados) return null
  const total =
    (parseDecimal(dados.P ?? '') ?? 0) +
    (parseDecimal(dados.M ?? '') ?? 0) +
    (parseDecimal(dados.G ?? '') ?? 0)
  return total > 0 ? total : null
}
