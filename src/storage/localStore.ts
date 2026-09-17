/** Leitura/gravação JSON no localStorage. JSON inválido vira null, sem quebrar o app. */
export function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeStore(key: string): void {
  localStorage.removeItem(key)
}
