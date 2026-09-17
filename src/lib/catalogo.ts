/**
 * Catálogo local: nome, preço e dose ficam salvos neste aparelho.
 * O cálculo de Insumos e Calda reaproveita em vez de digitar de novo.
 */
import { STORAGE_KEYS } from '@/data/constants'
import { createId } from '@/lib/id'
import { readStore, writeStore } from '@/storage/localStore'
import type {
  CatalogoCaderno,
  ProdutoCaldaCatalogo,
  ProdutoInsumoCatalogo,
  UnidadeDose,
} from '@/types/models'

const VAZIO: CatalogoCaderno = { insumos: [], calda: [] }

function chaveNome(nome: string) {
  return nome.trim().toLocaleLowerCase('pt-BR')
}

export function lerCatalogo(): CatalogoCaderno {
  const salvo = readStore<Partial<CatalogoCaderno>>(STORAGE_KEYS.catalogo)
  return {
    insumos: Array.isArray(salvo?.insumos) ? salvo.insumos : [],
    calda: Array.isArray(salvo?.calda) ? salvo.calda : [],
  }
}

function persistir(next: CatalogoCaderno) {
  writeStore(STORAGE_KEYS.catalogo, next)
  return next
}

export function guardarProdutoInsumo(input: {
  nome: string
  preco: string
  doseP: string
  doseM: string
  doseG: string
}): CatalogoCaderno {
  const nome = input.nome.trim()
  if (!nome) return lerCatalogo()
  const catalogo = lerCatalogo()
  const chave = chaveNome(nome)
  const existente = catalogo.insumos.find((item) => chaveNome(item.nome) === chave)
  const next: ProdutoInsumoCatalogo = {
    id: existente?.id ?? createId(),
    nome,
    preco: input.preco,
    doseP: input.doseP,
    doseM: input.doseM,
    doseG: input.doseG,
  }
  const insumos = existente
    ? catalogo.insumos.map((item) => (item.id === existente.id ? next : item))
    : [...catalogo.insumos, next]
  return persistir({ ...catalogo, insumos })
}

export function guardarProdutoCalda(input: {
  nome: string
  dose: string
  unidade: UnidadeDose
}): CatalogoCaderno {
  const nome = input.nome.trim()
  if (!nome) return lerCatalogo()
  const catalogo = lerCatalogo()
  const chave = chaveNome(nome)
  const existente = catalogo.calda.find((item) => chaveNome(item.nome) === chave)
  const next: ProdutoCaldaCatalogo = {
    id: existente?.id ?? createId(),
    nome,
    dose: input.dose,
    unidade: input.unidade,
  }
  const calda = existente
    ? catalogo.calda.map((item) => (item.id === existente.id ? next : item))
    : [...catalogo.calda, next]
  return persistir({ ...catalogo, calda })
}

export function removerProdutoInsumo(id: string): CatalogoCaderno {
  const catalogo = lerCatalogo()
  return persistir({
    ...catalogo,
    insumos: catalogo.insumos.filter((item) => item.id !== id),
  })
}

export function removerProdutoCalda(id: string): CatalogoCaderno {
  const catalogo = lerCatalogo()
  return persistir({
    ...catalogo,
    calda: catalogo.calda.filter((item) => item.id !== id),
  })
}

export function produtoInsumoPorId(id: string) {
  return lerCatalogo().insumos.find((item) => item.id === id) ?? null
}

export function produtoCaldaPorId(id: string) {
  return lerCatalogo().calda.find((item) => item.id === id) ?? null
}

export { VAZIO as CATALOGO_VAZIO }
