/** Calendário em português: o seletor nativo do Chrome segue o idioma do Windows. */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/format'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const DIAS = [
  { curto: 'D', nome: 'domingo' },
  { curto: 'S', nome: 'segunda' },
  { curto: 'T', nome: 'terça' },
  { curto: 'Q', nome: 'quarta' },
  { curto: 'Q', nome: 'quinta' },
  { curto: 'S', nome: 'sexta' },
  { curto: 'S', nome: 'sábado' },
]

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function isoDePartes(ano: number, mes: number, dia: number) {
  return `${ano}-${pad(mes + 1)}-${pad(dia)}`
}

export function formatarDataBr(iso: string) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  if (!ano || !mes || !dia) return iso
  return `${dia}/${mes}/${ano}`
}

function hojeIso() {
  const agora = new Date()
  return isoDePartes(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

function partesDoIso(iso: string) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return { ano, mes: mes - 1, dia }
}

export function DateField({
  label,
  name,
  value,
  onChange,
  hint,
}: {
  label: string
  name: string
  value: string
  onChange: (iso: string) => void
  hint?: ReactNode
}) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)
  const [visivel, setVisivel] = useState(() => {
    const base = partesDoIso(value) ?? partesDoIso(hojeIso())!
    return { ano: base.ano, mes: base.mes }
  })

  useEffect(() => {
    if (!aberto) return
    const base = partesDoIso(value) ?? partesDoIso(hojeIso())!
    setVisivel({ ano: base.ano, mes: base.mes })
  }, [aberto, value])

  useEffect(() => {
    if (!aberto) return
    function fechar(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setAberto(false)
    }
    function tecla(event: KeyboardEvent) {
      if (event.key === 'Escape') setAberto(false)
    }
    document.addEventListener('pointerdown', fechar)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fechar)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  const celulas = useMemo(() => {
    const primeiro = new Date(visivel.ano, visivel.mes, 1)
    const inicio = primeiro.getDay()
    const diasNoMes = new Date(visivel.ano, visivel.mes + 1, 0).getDate()
    const itens: Array<{ dia: number; iso: string } | null> = []
    for (let i = 0; i < inicio; i++) itens.push(null)
    for (let dia = 1; dia <= diasNoMes; dia++) {
      itens.push({ dia, iso: isoDePartes(visivel.ano, visivel.mes, dia) })
    }
    return itens
  }, [visivel.ano, visivel.mes])

  function mudarMes(delta: number) {
    setVisivel((atual) => {
      const data = new Date(atual.ano, atual.mes + delta, 1)
      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
  }

  const hoje = hojeIso()

  return (
    <div ref={rootRef} className="relative block space-y-1.5">
      <span className="text-[13px] font-semibold tracking-[0.02em] text-soil">
        {label}
      </span>
      <button
        type="button"
        id={id}
        name={name}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
        className="flex min-h-14 w-full items-center rounded-leaf border-0 bg-cream px-3.5 text-left text-[17px] font-medium text-ink outline-none focus:bg-paper focus:shadow-[0_0_0_2px_var(--color-field)] lg:min-h-12 lg:text-base"
      >
        {value ? formatarDataBr(value) : <span className="text-soil/30">dd/mm/aaaa</span>}
      </button>
      {aberto ? (
        <div
          role="dialog"
          aria-label="Escolher data"
          className="absolute z-30 mt-1 w-full min-w-[18rem] rounded-leaf border border-line bg-paper p-3 shadow-lift"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-leaf text-field"
              aria-label="Mês anterior"
              onClick={() => mudarMes(-1)}
            >
              ‹
            </button>
            <p className="font-display text-lg font-bold text-field">
              {MESES[visivel.mes]} de {visivel.ano}
            </p>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-leaf text-field"
              aria-label="Próximo mês"
              onClick={() => mudarMes(1)}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS.map((dia, index) => (
              <span
                key={`${dia.nome}-${index}`}
                title={dia.nome}
                className="py-1 text-[11px] font-semibold text-soil"
              >
                {dia.curto}
              </span>
            ))}
            {celulas.map((celula, index) =>
              celula ? (
                <button
                  key={celula.iso}
                  type="button"
                  onClick={() => {
                    onChange(celula.iso)
                    setAberto(false)
                  }}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-leaf text-sm font-medium',
                    celula.iso === value && 'bg-field text-cream',
                    celula.iso !== value && celula.iso === hoje && 'bg-mango/15 text-field',
                    celula.iso !== value && celula.iso !== hoje && 'text-ink hover:bg-cream',
                  )}
                >
                  {celula.dia}
                </button>
              ) : (
                <span key={`vazio-${index}`} />
              ),
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-leaf py-2 text-sm font-semibold text-field"
              onClick={() => {
                onChange(hoje)
                setAberto(false)
              }}
            >
              Hoje
            </button>
            {value ? (
              <button
                type="button"
                className="flex-1 rounded-leaf py-2 text-sm font-semibold text-soil"
                onClick={() => {
                  onChange('')
                  setAberto(false)
                }}
              >
                Limpar
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {hint ? <span className="block text-sm text-soil">{hint}</span> : null}
    </div>
  )
}
