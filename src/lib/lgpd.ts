/**
 * LGPD no aparelho: consentimento, exportar (portabilidade) e apagar.
 * Nada disso sobe para o MySQL — só o localStorage deste celular.
 */
import { POLITICA_VERSAO } from '@/data/lgpd'
import { STORAGE_KEYS } from '@/data/constants'
import { readStore, removeStore, writeStore } from '@/storage/localStore'

export interface ConsentimentoLgpd {
  versao: string
  aceitoEm: string
}

export interface PacoteTitular {
  geradoEm: string
  politicaVersao: string
  finalidade: string
  consentimento: ConsentimentoLgpd | null
  propriedade: unknown
  produtor: unknown
  calda: unknown
  insumos: unknown
  maoDeObra: unknown
  ciclo: unknown
  catalogo: unknown
  safras: unknown
}

export function lerConsentimento(): ConsentimentoLgpd | null {
  return readStore<ConsentimentoLgpd>(STORAGE_KEYS.consentimento)
}

/** Aceite só vale para a versão atual da política; senão o app pede de novo. */
export function consentimentoValido(atual: ConsentimentoLgpd | null) {
  return Boolean(atual?.aceitoEm && atual.versao === POLITICA_VERSAO)
}

export function registrarConsentimento(): ConsentimentoLgpd {
  const next: ConsentimentoLgpd = {
    versao: POLITICA_VERSAO,
    aceitoEm: new Date().toISOString(),
  }
  writeStore(STORAGE_KEYS.consentimento, next)
  return next
}

export function coletarDadosTitular(): PacoteTitular {
  return {
    geradoEm: new Date().toISOString(),
    politicaVersao: POLITICA_VERSAO,
    finalidade: 'Portabilidade e acesso, art. 18, IV e V, da LGPD',
    consentimento: lerConsentimento(),
    propriedade: readStore(STORAGE_KEYS.propriedade),
    produtor: readStore(STORAGE_KEYS.produtor),
    calda: readStore(STORAGE_KEYS.calda),
    insumos: readStore(STORAGE_KEYS.insumos),
    maoDeObra: readStore(STORAGE_KEYS.maoDeObra),
    ciclo: readStore(STORAGE_KEYS.ciclo),
    catalogo: readStore(STORAGE_KEYS.catalogo),
    safras: readStore(STORAGE_KEYS.safras),
  }
}

export function apagarDadosTitular() {
  for (const key of Object.values(STORAGE_KEYS)) {
    removeStore(key)
  }
}

export function baixarDadosTitular() {
  const pacote = coletarDadosTitular()
  const blob = new Blob([JSON.stringify(pacote, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dia = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `hexavale-meus-dados-${dia}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseConsentimento(value: unknown): ConsentimentoLgpd | null {
  if (!isRecord(value)) return null
  if (typeof value.versao !== 'string' || typeof value.aceitoEm !== 'string') return null
  return { versao: value.versao, aceitoEm: value.aceitoEm }
}

/** Confere se o JSON é uma cópia HexaVale antes de sobrescrever o caderno. */
export function parsePacoteTitular(raw: unknown): PacoteTitular | null {
  if (!isRecord(raw)) return null
  const temCaderno =
    'propriedade' in raw ||
    'produtor' in raw ||
    'ciclo' in raw ||
    'calda' in raw ||
    'insumos' in raw ||
    'maoDeObra' in raw ||
    'catalogo' in raw ||
    'safras' in raw
  if (!temCaderno) return null
  return {
    geradoEm: typeof raw.geradoEm === 'string' ? raw.geradoEm : new Date().toISOString(),
    politicaVersao: typeof raw.politicaVersao === 'string' ? raw.politicaVersao : '',
    finalidade: typeof raw.finalidade === 'string' ? raw.finalidade : '',
    consentimento: parseConsentimento(raw.consentimento),
    propriedade: raw.propriedade ?? null,
    produtor: raw.produtor ?? null,
    calda: raw.calda ?? null,
    insumos: raw.insumos ?? null,
    maoDeObra: raw.maoDeObra ?? null,
    ciclo: raw.ciclo ?? null,
    catalogo: raw.catalogo ?? null,
    safras: raw.safras ?? null,
  }
}

export function restaurarDadosTitular(pacote: PacoteTitular) {
  if (pacote.propriedade) writeStore(STORAGE_KEYS.propriedade, pacote.propriedade)
  if (pacote.produtor) writeStore(STORAGE_KEYS.produtor, pacote.produtor)
  if (pacote.calda) writeStore(STORAGE_KEYS.calda, pacote.calda)
  if (pacote.insumos) writeStore(STORAGE_KEYS.insumos, pacote.insumos)
  if (pacote.maoDeObra) writeStore(STORAGE_KEYS.maoDeObra, pacote.maoDeObra)
  if (pacote.ciclo) writeStore(STORAGE_KEYS.ciclo, pacote.ciclo)
  if (pacote.catalogo) writeStore(STORAGE_KEYS.catalogo, pacote.catalogo)
  if (pacote.safras) writeStore(STORAGE_KEYS.safras, pacote.safras)
  if (pacote.consentimento) writeStore(STORAGE_KEYS.consentimento, pacote.consentimento)
}

export async function lerArquivoPacote(file: File): Promise<PacoteTitular> {
  const texto = await file.text()
  let raw: unknown
  try {
    raw = JSON.parse(texto)
  } catch {
    throw new Error('Este arquivo não é um JSON válido.')
  }
  const pacote = parsePacoteTitular(raw)
  if (!pacote) {
    throw new Error('Este arquivo não é uma cópia do HexaVale.')
  }
  return pacote
}
