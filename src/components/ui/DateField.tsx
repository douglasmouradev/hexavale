/** Calendário em português: o seletor nativo do Chrome segue o idioma do Windows. */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

const DESK = '(min-width: 56.25rem)'

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

function ehCelular() {
  return typeof window === 'undefined' || !window.matchMedia(DESK).matches
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
  const folhaRef = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)
  const [folha, setFolha] = useState(ehCelular)
  const [visivel, setVisivel] = useState(() => {
    const base = partesDoIso(value) ?? partesDoIso(hojeIso())!
    return { ano: base.ano, mes: base.mes }
  })

  useEffect(() => {
    const mq = window.matchMedia(DESK)
    function sync() {
      setFolha(!mq.matches)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!aberto) return
    const base = partesDoIso(value) ?? partesDoIso(hojeIso())!
    setVisivel({ ano: base.ano, mes: base.mes })
  }, [aberto, value])

  useLayoutEffect(() => {
    if (!aberto || !folha) return
    const y = window.scrollY
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, y)
    return () => {
      document.body.style.overflow = overflow
      window.scrollTo(0, y)
    }
  }, [aberto, folha])

  useEffect(() => {
    if (!aberto) return
    function fechar(event: PointerEvent) {
      const alvo = event.target as Node
      if (rootRef.current?.contains(alvo)) return
      if (folhaRef.current?.contains(alvo)) return
      setAberto(false)
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

  function escolher(iso: string) {
    onChange(iso)
    setAberto(false)
  }

  const hoje = hojeIso()

  const painel = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-leaf text-field"
          aria-label="Mês anterior"
          onClick={() => mudarMes(-1)}
        >
          ‹
        </button>
        <p className="font-display text-lg font-semibold text-field">
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
              onClick={() => escolher(celula.iso)}
              className={cn(
                'flex h-11 items-center justify-center rounded-leaf text-sm font-medium',
                celula.iso === value && 'bg-field text-cream',
                celula.iso !== value && celula.iso === hoje && 'bg-mango/15 text-field',
                celula.iso !== value && celula.iso !== hoje && 'text-ink',
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
          className="flex-1 rounded-leaf py-2.5 text-sm font-semibold text-field"
          onClick={() => escolher(hoje)}
        >
          Hoje
        </button>
        {value ? (
          <button
            type="button"
            className="flex-1 rounded-leaf py-2.5 text-sm font-semibold text-soil"
            onClick={() => escolher('')}
          >
            Limpar
          </button>
        ) : null}
      </div>
    </>
  )

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
      {aberto && folha
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-40 bg-ink/40"
                role="presentation"
                onClick={() => setAberto(false)}
              />
              <div
                ref={folhaRef}
                role="dialog"
                aria-label="Escolher data"
                className="fixed inset-x-3 z-50 rounded-leaf border border-line bg-paper p-3 shadow-lift"
                style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
              >
                {painel}
              </div>
            </>,
            document.body,
          )
        : null}
      {aberto && !folha ? (
        <div
          ref={folhaRef}
          role="dialog"
          aria-label="Escolher data"
          className="absolute z-30 mt-1 w-full min-w-[18rem] rounded-leaf border border-line bg-paper p-3 shadow-lift"
        >
          {painel}
        </div>
      ) : null}
      {hint ? <span className="block text-sm text-soil">{hint}</span> : null}
    </div>
  )
}
