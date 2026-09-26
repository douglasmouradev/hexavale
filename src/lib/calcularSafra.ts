/**
 * Calcular safra: quatro intervalos da mangueira, contados para trás
 * a partir da data de colheita. Cada data pede uma ação.
 */
import { addDaysUtc, parseIsoUtc } from '@/lib/calendarioManga'
import { createId } from '@/lib/id'

export interface VariedadeSafra {
  id: string
  name: string
  /** Dias da poda até a nova estrutura vegetativa. */
  poda: number
  /** Dias para os ramos novos madurecerem e ganharem reserva. */
  vegetativo: number
  /** Dias da indução até a flor abrir. */
  inducao: number
  /** Dias da floração até a maturação e a colheita. */
  floracao: number
}

export interface MarcoSafra {
  nome: string
  data: Date
  /** Dias desde a etapa anterior. A poda é o começo. */
  dias: number | null
  acao: string
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

/** Da colheita para trás: floração, indução, estrutura nova e poda. */
export function marcosDaColheita(variedade: VariedadeSafra, colheitaIso: string): MarcoSafra[] {
  const colheita = parseIsoUtc(colheitaIso)
  const floracao = addDaysUtc(colheita, -variedade.floracao)
  const inducao = addDaysUtc(floracao, -variedade.inducao)
  const vegetativo = addDaysUtc(inducao, -variedade.vegetativo)
  const poda = addDaysUtc(vegetativo, -variedade.poda)

  return [
    {
      nome: 'Poda',
      data: poda,
      dias: null,
      acao: 'Podar para estimular uma nova brotação.',
      alvo: false,
    },
    {
      nome: 'Desenvolvimento vegetativo',
      data: vegetativo,
      dias: variedade.poda,
      acao: 'A planta apresenta a nova estrutura, com ramos novos e folhas. Esses ramos precisam madurecer e ganhar reserva para florir.',
      alvo: false,
    },
    {
      nome: 'Indução floral',
      data: inducao,
      dias: variedade.vegetativo,
      acao: 'Induzir a floração para a planta sair da fase vegetativa e entrar na reprodutiva.',
      alvo: false,
    },
    {
      nome: 'Floração',
      data: floracao,
      dias: variedade.inducao,
      acao: 'As folhas dão lugar à flor. Acompanhar a emissão, o pegamento e o desenvolvimento dos frutos.',
      alvo: false,
    },
    {
      nome: 'Colheita',
      data: colheita,
      dias: variedade.floracao,
      acao: 'Maturação e colheita.',
      alvo: true,
    },
  ]
}
