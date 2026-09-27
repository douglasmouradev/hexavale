import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/data/constants'
import { removeStore } from '@/storage/localStore'

/** Só em memória: sobrevive à troca de aba, some ao fechar o app, recarregar ou sair. */
const memoria = new Map<string, unknown>()

const CALCULOS_ANTIGOS = [
  STORAGE_KEYS.calcularSafra,
  STORAGE_KEYS.regulador,
  STORAGE_KEYS.custoCalda,
  STORAGE_KEYS.calendario,
]

export function useSessionState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() =>
    memoria.has(key) ? (memoria.get(key) as T) : initial,
  )
  useEffect(() => {
    memoria.set(key, state)
  }, [key, state])
  return [state, setState] as const
}

/** Zera os cálculos da sessão e apaga o que versões antigas deixaram gravado no aparelho. */
export function limparCalculos() {
  memoria.clear()
  for (const key of CALCULOS_ANTIGOS) removeStore(key)
}
