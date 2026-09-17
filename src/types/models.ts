/** Cultura atendida pelo HexaVale no Vale do São Francisco. */
export type Cultura = 'manga' | 'uva'

/** Identidade local do produtor (não vai para o servidor). */
export interface Propriedade {
  telefone: string
  nome: string
  loggedAt: string
}

/** Safra desta propriedade: cultura, datas e área usadas na calda e no ciclo. */
export interface ConfigProdutor {
  cultura: Cultura | null
  dataReferencia: string | null
  dataColheita: string | null
  areaHectares: string | null
}

export type UnidadeDose = 'ml/L' | 'g/L' | 'ml/ha' | 'g/ha' | 'L/ha' | 'kg/ha'

export interface Insumo {
  id: string
  nome: string
  dose: number
  unidade: UnidadeDose
}

export type UnidadeTempo = 'dias' | 'horas'

export interface InsumoSemana {
  nome: string
  quantidade: number
  custo: number
  /** 'insumos' veio da tela Insumos; 'manual' foi digitado no Ciclo. */
  origem?: 'insumos' | 'manual'
}

export interface MaoDeObraSemana {
  descricao: string
  pessoas: number
  diaria: number
  dias: number
  /** 'mao-de-obra' veio da tela Diária; 'manual' foi digitado no Ciclo. */
  origem?: 'mao-de-obra' | 'manual'
}

export interface MecanizacaoSemana {
  descricao: string
  horas: number
  custoHora: number
}

export interface SemanaCiclo {
  numero: number
  dataInicio: string
  dataFim: string
  tipoTrabalho: string
  insumos: InsumoSemana[]
  maoDeObra: MaoDeObraSemana[]
  mecanizacao: MecanizacaoSemana[]
}

export interface CicloCultura {
  id: string
  cultura: Cultura | null
  dataInicio: string | null
  dataColheita: string | null
  semanas: SemanaCiclo[]
  atualizadoEm: string
}

export interface TotaisCiclo {
  insumos: number
  maoDeObra: number
  mecanizacao: number
  geral: number
}

export const PRODUTOR_PADRAO: ConfigProdutor = {
  cultura: null,
  dataReferencia: null,
  dataColheita: null,
  areaHectares: null,
}
