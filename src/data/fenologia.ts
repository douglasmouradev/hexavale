import type { Cultura } from '@/types/models'

/** Trabalho sugerido por faixa de semana (manga). */
const MANGA: Record<string, string> = {
  '1-3': 'Poda e limpeza do pomar',
  '4-6': 'Adubação e irrigação pós-poda',
  '7-10': 'Indução floral',
  '11-16': 'Brotação e nutrição',
  '17-22': 'Florada e pulverizações',
  '23-28': 'Pegamento do fruto',
  '29-35': 'Engorda e tratos',
  '36-39': 'Pré-colheita',
  '40-42': 'Colheita',
}

/** Trabalho sugerido por faixa de semana (uva). */
const UVA: Record<string, string> = {
  '1-4': 'Poda e amarrio',
  '5-8': 'Brotação e desbrota',
  '9-14': 'Florada e raleio',
  '15-22': 'Formação do cacho',
  '23-32': 'Enchimento da baga',
  '33-38': 'Pré-colheita',
  '39-42': 'Colheita',
}

export interface FaseCiclo {
  titulo: string
  inicio: number
  fim: number
}

/** Agrupa as 42 semanas nas fases da cultura (a tela Ciclo usa isso em vez de 42 cartões). */
export function fasesDaCultura(cultura: Cultura | null): FaseCiclo[] {
  const mapa = cultura === 'uva' ? UVA : MANGA
  return Object.entries(mapa).map(([faixa, titulo]) => {
    const [inicio, fim] = faixa.split('-').map(Number)
    return { titulo, inicio: inicio ?? 1, fim: fim ?? inicio ?? 1 }
  })
}

export function faseDaSemana(cultura: Cultura | null, numero: number) {
  return (
    fasesDaCultura(cultura).find(
      (fase) => numero >= fase.inicio && numero <= fase.fim,
    ) ?? null
  )
}

/** Nome do trato sugerido para a semana, segundo a cultura. */
export function sugestaoSemana(cultura: Cultura | null, numero: number) {
  return faseDaSemana(cultura, numero)?.titulo ?? 'Tratos culturais'
}

export const TRABALHOS_CICLO = [
  'Poda e limpeza do pomar',
  'Adubação e irrigação pós-poda',
  'Indução floral',
  'Brotação e nutrição',
  'Florada e pulverizações',
  'Pegamento do fruto',
  'Engorda e tratos',
  'Pré-colheita',
  'Colheita',
  'Poda e amarrio',
  'Brotação e desbrota',
  'Florada e raleio',
  'Formação do cacho',
  'Enchimento da baga',
  'Capina',
  'Irrigação',
  'Pulverização',
]
