/** Leitura/gravação JSON no localStorage. JSON inválido vira null, sem quebrar o app. */
import { STORAGE_KEYS } from '@/data/constants'
import {
  compactarCalendarioState,
  expandirCalendarioState,
} from '@/lib/calendarioManga'

export const CADERNO_ERRO_EVENTO = 'hexavale:caderno-erro'

export type MotivoCadernoErro = 'cota' | 'invalido'

export type WriteResult = { ok: true } | { ok: false; motivo: MotivoCadernoErro }

function isQuotaExceeded(error: unknown) {
  if (!(error instanceof DOMException)) return false
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22
  )
}

function avisarCaderno(motivo: MotivoCadernoErro) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<MotivoCadernoErro>(CADERNO_ERRO_EVENTO, { detail: motivo }),
  )
}

function paraDisco(key: string, value: unknown) {
  if (key === STORAGE_KEYS.calendario) return compactarCalendarioState(value)
  return value
}

function daDisco<T>(key: string, value: T): T {
  if (key === STORAGE_KEYS.calendario) return expandirCalendarioState(value) as T
  return value
}

export function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return daDisco(key, JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeStore<T>(key: string, value: T): WriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(paraDisco(key, value)))
    return { ok: true }
  } catch (error) {
    const motivo: MotivoCadernoErro = isQuotaExceeded(error) ? 'cota' : 'invalido'
    avisarCaderno(motivo)
    return { ok: false, motivo }
  }
}

export function removeStore(key: string): void {
  localStorage.removeItem(key)
}
