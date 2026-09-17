export type Cultura = 'manga' | 'uva'

export interface Propriedade {
  telefone: string
  nome: string
  loggedAt: string
}

export interface ConfigProdutor {
  cultura: Cultura | null
  dataReferencia: string | null
  dataColheita: string | null
}

export type UnidadeDose = 'ml/L' | 'g/L' | 'ml/ha' | 'g/ha' | 'L/ha' | 'kg/ha'

export interface Insumo {
  id: string
  nome: string
  dose: number
  unidade: UnidadeDose
}

export interface CaldaOrganica {
  id: string
  tanqueLitros: number
  areaHectares: number
  litrosPorHectare: number
  insumos: Insumo[]
  atualizadoEm: string
}

export type PortePlanta = 'P' | 'M' | 'G'

export interface PlantasPorPorte {
  P: number
  M: number
  G: number
}

export interface Produto {
  id: string
  nome: string
  valorUnitario: number
  unidade: string
  dosesPorPorte: Record<PortePlanta, number>
}

export interface LevantamentoInsumos {
  id: string
  plantas: PlantasPorPorte
  produtos: Produto[]
  atualizadoEm: string
}

export type UnidadeTempo = 'dias' | 'horas'

export interface AtividadeMaoDeObra {
  id: string
  nome: string
  trabalhadores: number
  valorDiaria: number
  tempoEstimado: number
  unidadeTempo: UnidadeTempo
}

export interface LevantamentoMaoDeObra {
  id: string
  atividades: AtividadeMaoDeObra[]
  atualizadoEm: string
}

export interface InsumoSemana {
  produtoId?: string
  nome: string
  quantidade: number
  custo: number
}

export interface MaoDeObraSemana {
  atividadeId?: string
  descricao: string
  pessoas: number
  diaria: number
  dias: number
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
}
