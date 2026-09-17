/** JWT do admin no localStorage. O produtor não usa esta chave. */
const ADMIN_TOKEN_KEY = 'hexa-manga:admin-token'

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getAdminToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(path, { ...init, headers })
  const tipo = response.headers.get('content-type') || ''
  if (!tipo.includes('application/json')) {
    throw new Error('Recarregue com Ctrl+Shift+R e entre de novo no painel.')
  }
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || 'Falha na requisição.')
  }
  return data
}

export interface AdVideo {
  id: number
  titulo: string
  url: string
  ativo: boolean
  tamanho_bytes?: number
  criado_em?: string
}

/** Pedido do vídeo atual — sem telefone, nome ou caderno do produtor. */
export async function fetchCurrentAd() {
  try {
    const response = await fetch('/api/ads/atual')
    const tipo = response.headers.get('content-type') || ''
    if (!response.ok || !tipo.includes('application/json')) return null
    const data = (await response.json()) as { id: number; titulo: string; url: string }
    if (!data?.url) return null
    return data
  } catch {
    return null
  }
}
