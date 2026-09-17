import { useState } from 'react'
import { usePersistValue } from '@/hooks/usePersistValue'
import { readStore } from '@/storage/localStore'

/** Estado que grava sozinho no localStorage (com atraso, para não travar a digitação). */
export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readStore<T>(key) ?? initial)
  usePersistValue(key, state)
  return [state, setState] as const
}
