/**
 * Calcular safra: quatro intervalos da mangueira, contados para trás
 * a partir da data de colheita.
 */
import { addDaysUtc, parseIsoUtc } from '@/lib/calendarioManga'
import { createId } from '@/lib/id'

export interface VariedadeSafra {
  id: string
  name: string
  /** Dias da poda até o regulador de crescimento. */
  poda: number
  /** Dias do regulador até a indução floral. */
  vegetativo: number
  /** Dias da indução até o florescimento. */
  inducao: number
  /** Dias do florescimento até a colheita. */
  floracao: number
}

export interface MarcoSafra {
  nome: string
  data: Date
  /** Dias desde a etapa anterior. A poda é o começo. */
  dias: number | null
  alvo: boolean
}

export function variedadePalmer(): VariedadeSafra {
  return {
    id: createId(),
    name: 'Palmer',
    poda: 60,
    vegetativo: 90,
    inducao: 30,
    floracao: 140,
  }
}

export function diasDoCiclo(variedade: VariedadeSafra) {
  return variedade.poda + variedade.vegetativo + variedade.inducao + variedade.floracao
}

export function diasNaoNegativos(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

/** Da colheita para trás: florescimento, indução, regulador e poda. */
export function marcosDaColheita(variedade: VariedadeSafra, colheitaIso: string): MarcoSafra[] {
  const colheita = parseIsoUtc(colheitaIso)
  const floracao = addDaysUtc(colheita, -variedade.floracao)
  const inducao = addDaysUtc(floracao, -variedade.inducao)
  const vegetativo = addDaysUtc(inducao, -variedade.vegetativo)
  const poda = addDaysUtc(vegetativo, -variedade.poda)

  return [
    { nome: 'Poda → Regulador de Crescimento', data: poda, dias: null, alvo: false },
    { nome: 'Regulador → Indução floral', data: vegetativo, dias: variedade.poda, alvo: false },
    { nome: 'Indução floral → Florescimento', data: inducao, dias: variedade.vegetativo, alvo: false },
    { nome: 'Florescimento → Colheita', data: floracao, dias: variedade.inducao, alvo: false },
    { nome: 'Colheita', data: colheita, dias: variedade.floracao, alvo: true },
  ]
}
