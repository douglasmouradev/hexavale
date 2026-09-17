import { useEffect, useRef } from 'react'
import { writeStore } from '@/storage/localStore'

const ATRASO_MS = 400

/** Grava no caderno com atraso; no fechamento da tela, descarrega o último valor. */
export function usePersistValue<T>(key: string, value: T) {
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeStore(key, value)
    }, ATRASO_MS)
    return () => window.clearTimeout(timer)
  }, [key, value])

  useEffect(() => {
    function flush() {
      writeStore(key, valueRef.current)
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [key])
}
