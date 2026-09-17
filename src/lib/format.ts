/** Telefone BR, moeda e número com vírgula (campo de produtor). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ')
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value)
  return digits.length >= 10 && digits.length <= 11
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Número no jeito do produtor: 1,5 e 2.000 (mil) e 2.000,50.
 * Um ponto com 1–2 casas continua decimal (0,32 escrito 0.32).
 */
export function parseDecimal(value: string): number | null {
  const raw = value.trim().replace(/\s/g, '').replace(/[^\d,.-]/g, '')
  if (!raw || raw === '-' || raw === ',' || raw === '.') return null

  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')
  let normalized = raw

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = raw.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = raw.replace(/,/g, '')
    }
  } else if (lastComma !== -1) {
    const partes = raw.split(',')
    normalized =
      partes.length === 2 ? `${partes[0]}.${partes[1]}` : raw.replace(/,/g, '')
  } else if (lastDot !== -1) {
    const partes = raw.split('.')
    if (partes.length > 2) {
      normalized = raw.replace(/\./g, '')
    } else if (
      partes.length === 2 &&
      partes[1]?.length === 3 &&
      partes[0] !== '' &&
      partes[0] !== '-' &&
      !/^-?0$/.test(partes[0] ?? '')
    ) {
      normalized = raw.replace(/\./g, '')
    }
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/** 15/12/2026 → 15 de dez 2026, sem puxar date-fns. */
export function formatDiaPorExtenso(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  const nomeMes = MESES_CURTOS[Number(mes) - 1]
  if (!ano || !dia || !nomeMes) return iso
  return `${dia} de ${nomeMes} ${ano}`
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value)
}
