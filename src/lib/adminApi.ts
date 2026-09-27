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

export interface LoginRegistro {
  id: number
  telefone: string
  propriedade: string
  criado_em: string
}

/** Sem internet o login segue normal; o registro só se perde. */
export async function registrarLogin(telefone: string, propriedade: string) {
  try {
    await fetch('/api/login-historico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone, propriedade }),
      keepalive: true,
    })
  } catch {
    // Ignora falha de rede.
  }
}

/** Pedido do vídeo atual — sem telefone, nome ou caderno do produtor. */
export async function fetchCurrentAd() {
  for (let tentativa = 0; tentativa < 3; tentativa += 1) {
    try {
      const response = await fetch(`/api/ads/atual?t=${Date.now()}`, { cache: 'no-store' })
      const tipo = response.headers.get('content-type') || ''
      if (!tipo.includes('application/json')) {
        if (tentativa < 2) continue
        return null
      }
      if (response.status === 404) return null
      if (!response.ok) {
        if (tentativa < 2) continue
        return null
      }
      const data = (await response.json()) as { id: number; titulo: string; url: string }
      if (!data?.url) return null
      return data
    } catch {
      if (tentativa < 2) {
        await new Promise((resolve) => window.setTimeout(resolve, 400))
        continue
      }
      return null
    }
  }
  return null
}
