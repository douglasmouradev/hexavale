import { useEffect, useState } from 'react'
import { readStore, writeStore } from '@/storage/localStore'

export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readStore<T>(key) ?? initial)

  useEffect(() => {
    writeStore(key, state)
  }, [key, state])

  return [state, setState] as const
}
