/** Regras do anúncio: duração na tela e intervalo mínimo entre exibições. */
export type AdPlacement = 'login' | 'calculate'

export interface InterstitialPolicy {
  durationSeconds: number
  skipAfterSeconds: number
}

export interface AdAtual {
  id: number
  titulo: string
  url: string
}

const POLICIES: Record<AdPlacement, InterstitialPolicy> = {
  login: { durationSeconds: 15, skipAfterSeconds: 10 },
  calculate: { durationSeconds: 8, skipAfterSeconds: 5 },
}

const AD_LAST_SHOWN_KEY = 'hexa-manga:ad-last-shown'
const AD_SESSAO_KEY = 'hexavale:ad-sessao'
/** 15 minutos: no pomar o cálculo não pode parar a cada toque. */
const AD_COOLDOWN_MS = 15 * 60 * 1000

export function getAdPolicy(placement: AdPlacement): InterstitialPolicy {
  return POLICIES[placement]
}

export function adEmCooldown() {
  const last = Number(localStorage.getItem(AD_LAST_SHOWN_KEY) || '0')
  return Date.now() - last < AD_COOLDOWN_MS
}

export function marcarAdExibido() {
  localStorage.setItem(AD_LAST_SHOWN_KEY, String(Date.now()))
}

export function adSessaoJaMostrada() {
  try {
    return sessionStorage.getItem(AD_SESSAO_KEY) === '1'
  } catch {
    return false
  }
}

export function marcarAdSessao() {
  try {
    sessionStorage.setItem(AD_SESSAO_KEY, '1')
  } catch {
    /* aparelho sem sessionStorage */
  }
}

export function limparAdSessao() {
  try {
    sessionStorage.removeItem(AD_SESSAO_KEY)
  } catch {
    /* aparelho sem sessionStorage */
  }
}
