/**
 * Pizza interativa: toque na fatia ou na legenda destaca o item
 * e troca o miolo pelo valor daquela parte.
 */
import { useMemo, useState } from 'react'
import { cn } from '@/lib/format'

export interface FatiaPizza {
  label: string
  value: number
  detalhe?: string
}

const CORES_PAPEL = ['#e85d04', '#2f6a48', '#6d3b8a', '#8f3a16', '#1a3d2b', '#3a2a1c']
const CORES_CAMPO = ['#ff9f4a', '#f6f1e8', '#c48fd9', '#e85d04', '#e4d9c5']

const CX = 60
const CY = 60
const R_EXT = 52
const R_INT = 28

function encurtar(texto: string, limite = 16) {
  const limpo = texto.trim()
  if (limpo.length <= limite) return limpo
  return `${limpo.slice(0, limite - 1)}…`
}

function tinta(cor: string) {
  const hex = cor.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const clara = (r * 299 + g * 587 + b * 114) / 1000 > 155
  return clara ? '#171411' : '#fffcf7'
}

function polar(angulo: number, raio: number) {
  const rad = ((angulo - 90) * Math.PI) / 180
  return { x: CX + raio * Math.cos(rad), y: CY + raio * Math.sin(rad) }
}

function fatiaPath(inicio: number, fim: number, externo: number, interno: number) {
  const grande = fim - inicio > 180 ? 1 : 0
  const a = polar(inicio, externo)
  const b = polar(fim, externo)
  const c = polar(fim, interno)
  const d = polar(inicio, interno)
  return `M ${a.x} ${a.y} A ${externo} ${externo} 0 ${grande} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${interno} ${interno} 0 ${grande} 0 ${d.x} ${d.y} Z`
}

export function GraficoPizza({
  fatias,
  formatValor,
  centro,
  invert = false,
}: {
  fatias: FatiaPizza[]
  formatValor: (value: number) => string
  centro?: string
  invert?: boolean
}) {
  const [ativa, setAtiva] = useState<number | null>(null)

  const desenhos = useMemo(() => {
    const validas = fatias.filter((fatia) => fatia.value > 0)
    const total = validas.reduce((sum, fatia) => sum + fatia.value, 0)
    if (!validas.length || total <= 0) return { total: 0, itens: [] }

    const cores = invert ? CORES_CAMPO : CORES_PAPEL
    let cursor = 0
    const itens = validas.map((fatia, index) => {
      const varredura = (fatia.value / total) * 360
      const inicio = cursor
      const fim = cursor + Math.max(varredura - 1.2, 0.8)
      cursor += varredura
      return {
        ...fatia,
        index,
        cor: cores[index % cores.length],
        inicio,
        fim,
        meio: inicio + varredura / 2,
        percentual: Math.round((fatia.value / total) * 100),
      }
    })
    return { total, itens }
  }, [fatias, invert])

  if (!desenhos.itens.length) return null

  const escolhida = ativa !== null ? desenhos.itens[ativa] : null

  function alternar(index: number) {
    setAtiva((atual) => (atual === index ? null : index))
  }

  const mioloTitulo = escolhida ? encurtar(escolhida.label) : 'Total'
  const mioloValor = escolhida
    ? formatValor(escolhida.value)
    : (centro ?? formatValor(desenhos.total))
  const mioloApoio = escolhida ? `${escolhida.percentual}%` : null

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 sm:flex-row sm:items-center',
        invert && 'text-white',
      )}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-52 w-52 shrink-0 touch-manipulation lg:h-64 lg:w-64"
        role="img"
        aria-label="Toque numa fatia para ver o valor"
      >
        {desenhos.itens.map((fatia) => {
          const destaque = escolhida?.index === fatia.index
          const apagada = escolhida !== null && !destaque
          const empurrar = destaque ? polar(fatia.meio, 3) : { x: CX, y: CY }
          const dx = empurrar.x - CX
          const dy = empurrar.y - CY
          const rotulo = polar(fatia.meio, (R_EXT + R_INT) / 2)
          return (
            <g
              key={`${fatia.label}-${fatia.index}`}
              transform={`translate(${dx} ${dy})`}
              opacity={apagada ? 0.38 : 1}
              className="cursor-pointer"
              onClick={() => alternar(fatia.index)}
            >
              <title>
                {fatia.label}: {formatValor(fatia.value)} ({fatia.percentual}%)
              </title>
              <path
                d={fatiaPath(fatia.inicio, fatia.fim, destaque ? R_EXT + 1.5 : R_EXT, R_INT)}
                fill={fatia.cor}
                className="outline-none"
              />
              {fatia.percentual >= 8 ? (
                <text
                  x={rotulo.x}
                  y={rotulo.y}
                  textAnchor="middle"
                  fill={tinta(fatia.cor)}
                  pointerEvents="none"
                  style={{
                    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <tspan x={rotulo.x} dy="-0.3em" fontSize="6.2" fontWeight="700">
                    {fatia.percentual}%
                  </tspan>
                  <tspan x={rotulo.x} dy="1.2em" fontSize="5.2" fontWeight="700">
                    {formatValor(fatia.value)}
                  </tspan>
                </text>
              ) : null}
            </g>
          )
        })}

        <circle
          cx={CX}
          cy={CY}
          r={R_INT - 0.6}
          fill={invert ? '#1a3d2b' : '#fffcf7'}
          className="cursor-pointer"
          onClick={() => setAtiva(null)}
        />
        <text
          x={CX}
          y={CY - (mioloApoio ? 2 : 1)}
          textAnchor="middle"
          fill={invert ? '#fffcf7' : '#171411'}
          pointerEvents="none"
          style={{ fontFamily: '"Source Sans 3", "Segoe UI", sans-serif' }}
        >
          <tspan
            x={CX}
            dy="-0.55em"
            fontSize="5.5"
            fill={invert ? 'rgba(255,252,247,0.7)' : '#3a2a1c'}
          >
            {mioloTitulo}
          </tspan>
          <tspan
            x={CX}
            dy="1.45em"
            fontSize={escolhida ? '7.4' : '8.2'}
            fontWeight="700"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {mioloValor}
          </tspan>
          {mioloApoio ? (
            <tspan
              x={CX}
              dy="1.35em"
              fontSize="6"
              fill={invert ? 'rgba(255,252,247,0.7)' : '#3a2a1c'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {mioloApoio}
            </tspan>
          ) : null}
        </text>
      </svg>

      <ul className="w-full min-w-0 space-y-1">
        {desenhos.itens.map((fatia) => {
          const destaque = escolhida?.index === fatia.index
          return (
            <li key={`${fatia.label}-${fatia.index}`}>
              <button
                type="button"
                aria-pressed={destaque}
                onClick={() => alternar(fatia.index)}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2 rounded-leaf px-2 text-left text-[13px] leading-snug',
                  destaque && (invert ? 'bg-white/12' : 'bg-cream'),
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-chip"
                  style={{ background: fatia.cor }}
                />
                <span className="min-w-0 flex-1">{fatia.label}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums tracking-tight">
                  {fatia.percentual}%
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
