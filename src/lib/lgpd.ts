/**
 * LGPD no aparelho: consentimento, exportar (portabilidade) e apagar.
 * Nada disso sobe para o MySQL — só o localStorage deste celular.
 */
import { POLITICA_VERSAO } from '@/data/lgpd'
import { STORAGE_KEYS } from '@/data/constants'
import { marcarCopiaFeita } from '@/lib/copia'
import { readStore, removeStore, writeStore } from '@/storage/localStore'
import type { ConfigProdutor, Propriedade } from '@/types/models'

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
  custoCalda: unknown
  regulador: unknown
  calendario: unknown
  calcularSafra: unknown
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
    custoCalda: readStore(STORAGE_KEYS.custoCalda),
    regulador: readStore(STORAGE_KEYS.regulador),
    calendario: readStore(STORAGE_KEYS.calendario),
    calcularSafra: readStore(STORAGE_KEYS.calcularSafra),
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
  marcarCopiaFeita()
}

/** No celular, abre o compartilhar do sistema; no computador, baixa o JSON. */
export async function compartilharDadosTitular() {
  const pacote = coletarDadosTitular()
  const dia = new Date().toISOString().slice(0, 10)
  const nome = `hexavale-meus-dados-${dia}.json`
  const texto = JSON.stringify(pacote, null, 2)
  const blob = new Blob([texto], { type: 'application/json' })
  const arquivo = new File([blob], nome, { type: 'application/json' })
  try {
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }
    if (typeof navigator.share === 'function') {
      const comArquivo: ShareData = { title: 'Cópia do caderno Hexavale', files: [arquivo] }
      if (!nav.canShare || nav.canShare(comArquivo)) {
        await navigator.share(comArquivo)
        marcarCopiaFeita()
        return true
      }
      await navigator.share({ title: 'Cópia do caderno Hexavale', text: texto })
      marcarCopiaFeita()
      return true
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return false
  }
  baixarDadosTitular()
  return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseConsentimento(value: unknown): ConsentimentoLgpd | null {
  if (!isRecord(value)) return null
  if (typeof value.versao !== 'string' || typeof value.aceitoEm !== 'string') return null
  return { versao: value.versao, aceitoEm: value.aceitoEm }
}

function parseIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return null
  const dia = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null
  return dia
}

function parsePropriedade(value: unknown): Propriedade | null {
  if (!isRecord(value)) return null
  if (typeof value.nome !== 'string' || typeof value.telefone !== 'string') return null
  const nome = value.nome.trim().slice(0, 120)
  const telefone = value.telefone.replace(/\D/g, '').slice(0, 11)
  if (!nome || telefone.length < 10) return null
  return {
    nome,
    telefone,
    loggedAt: typeof value.loggedAt === 'string' ? value.loggedAt : new Date().toISOString(),
  }
}

function parseProdutor(value: unknown): ConfigProdutor | null {
  if (!isRecord(value)) return null
  const cultura = value.cultura
  if (cultura !== null && cultura !== undefined && cultura !== 'manga' && cultura !== 'uva') {
    return null
  }
  const area =
    typeof value.areaHectares === 'string' || value.areaHectares === null
      ? value.areaHectares
      : null
  const texto = (campo: unknown) =>
    typeof campo === 'string' || campo === null ? campo : null
  return {
    cultura: cultura === 'manga' || cultura === 'uva' ? cultura : null,
    dataReferencia: parseIsoDate(value.dataReferencia),
    dataColheita: parseIsoDate(value.dataColheita),
    areaHectares: area,
    nomeResponsavel: texto(value.nomeResponsavel),
    municipio: texto(value.municipio),
    talhoes: texto(value.talhoes),
  }
}

function parseObjetoCaderno(value: unknown): unknown {
  if (value == null) return null
  if (typeof value !== 'object') return null
  return value
}

function parseCiclo(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.semanas)) return null
  const semanas = value.semanas.filter((semana) => {
    if (!isRecord(semana)) return false
    return (
      typeof semana.numero === 'number' &&
      semana.numero >= 1 &&
      semana.numero <= 42 &&
      typeof semana.dataInicio === 'string' &&
      typeof semana.dataFim === 'string'
    )
  })
  if (value.semanas.length > 0 && semanas.length === 0) return null
  return { ...value, semanas }
}

/** Confere se o JSON é uma cópia HexaVale antes de sobrescrever o caderno. */
export function parsePacoteTitular(raw: unknown): PacoteTitular | null {
  if (!isRecord(raw)) return null
  const pacote: PacoteTitular = {
    geradoEm: typeof raw.geradoEm === 'string' ? raw.geradoEm : new Date().toISOString(),
    politicaVersao: typeof raw.politicaVersao === 'string' ? raw.politicaVersao : '',
    finalidade: typeof raw.finalidade === 'string' ? raw.finalidade : '',
    consentimento: parseConsentimento(raw.consentimento),
    propriedade: parsePropriedade(raw.propriedade),
    produtor: parseProdutor(raw.produtor),
    calda: parseObjetoCaderno(raw.calda),
    insumos: parseObjetoCaderno(raw.insumos),
    maoDeObra: parseObjetoCaderno(raw.maoDeObra),
    ciclo: parseCiclo(raw.ciclo),
    catalogo: parseObjetoCaderno(raw.catalogo),
    safras: parseObjetoCaderno(raw.safras),
    custoCalda: parseObjetoCaderno(raw.custoCalda),
    regulador: parseObjetoCaderno(raw.regulador),
    calendario: parseObjetoCaderno(raw.calendario),
    calcularSafra: parseObjetoCaderno(raw.calcularSafra),
  }
  const temCaderno = Boolean(
    pacote.propriedade ||
      pacote.produtor ||
      pacote.ciclo ||
      pacote.calda ||
      pacote.insumos ||
      pacote.maoDeObra ||
      pacote.catalogo ||
      pacote.safras ||
      pacote.custoCalda ||
      pacote.regulador ||
      pacote.calendario ||
      pacote.calcularSafra,
  )
  if (!temCaderno) return null
  return pacote
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
  if (pacote.custoCalda) writeStore(STORAGE_KEYS.custoCalda, pacote.custoCalda)
  if (pacote.regulador) writeStore(STORAGE_KEYS.regulador, pacote.regulador)
  if (pacote.calendario) writeStore(STORAGE_KEYS.calendario, pacote.calendario)
  if (pacote.calcularSafra) writeStore(STORAGE_KEYS.calcularSafra, pacote.calcularSafra)
  if (pacote.consentimento) writeStore(STORAGE_KEYS.consentimento, pacote.consentimento)
}

export async function lerArquivoPacote(file: File): Promise<PacoteTitular> {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Este arquivo é grande demais para uma cópia do Hexavale.')
  }
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
