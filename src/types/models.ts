/** Cultura atendida pelo HexaVale no Vale do São Francisco. */
export type Cultura = 'manga' | 'uva'

/** Identidade local do produtor (não vai para o servidor). */
export interface Propriedade {
  telefone: string
  nome: string
  loggedAt: string
}

/** Safra desta propriedade: cultura, datas e área usadas nas calculadoras. */
export interface ConfigProdutor {
  cultura: Cultura | null
  dataReferencia: string | null
  dataColheita: string | null
  areaHectares: string | null
  nomeResponsavel: string | null
  municipio: string | null
  talhoes: string | null
}

export const PRODUTOR_PADRAO: ConfigProdutor = {
  cultura: null,
  dataReferencia: null,
  dataColheita: null,
  areaHectares: null,
  nomeResponsavel: null,
  municipio: null,
  talhoes: null,
}
