import type { Cultura } from '@/types/models'

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

const UVA: Record<string, string> = {
  '1-4': 'Poda e amarrio',
  '5-8': 'Brotação e desbrota',
  '9-14': 'Florada e raleio',
  '15-22': 'Formação do cacho',
  '23-32': 'Enchimento da baga',
  '33-38': 'Pré-colheita',
  '39-42': 'Colheita',
}

function noIntervalo(numero: number, chave: string) {
  const [inicio, fim] = chave.split('-').map(Number)
  return numero >= (inicio ?? 0) && numero <= (fim ?? 0)
}

export function sugestaoSemana(cultura: Cultura | null, numero: number) {
  const mapa = cultura === 'uva' ? UVA : MANGA
  const encontrada = Object.entries(mapa).find(([faixa]) => noIntervalo(numero, faixa))
  return encontrada?.[1] ?? 'Tratos culturais'
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
