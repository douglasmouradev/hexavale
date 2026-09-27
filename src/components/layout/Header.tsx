/** Topo sólido. Logo ou título à esquerda, avatar à direita — o furo da câmera fica no meio. */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { useApp } from '@/context/AppContext'

const TITLES: Record<string, string> = {
  '/': 'Início',
  '/safra': 'Calcular Safra',
  '/regulador': 'Calcular PBZ',
  '/custo-calda': 'Calcular Calda Orgânica',
  '/calendario': 'Tratos culturais',
  '/meus-dados': 'Meus dados',
}

function inicial(nome: string) {
  const letra = nome.trim().charAt(0)
  return letra ? letra.toLocaleUpperCase('pt-BR') : 'H'
}

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { propriedade, produtor } = useApp()
  const isHome = pathname === '/'
  const title = TITLES[pathname] ?? 'Hexavale'
  const nomeAvatar = produtor.nomeResponsavel || propriedade?.nome || 'Hexavale'

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper pt-[max(0.65rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full min-w-0 max-w-lg items-center gap-3 overflow-x-clip px-3 py-2 desk:max-w-6xl desk:px-8 desk:py-3.5">
        {isHome ? (
          <>
            <div className="min-w-0 flex-1 desk:hidden">
              <Wordmark height={26} />
            </div>
            <div className="hidden min-w-0 flex-1 desk:block">
              <p className="font-display text-2xl font-semibold leading-tight text-field">
                {propriedade?.nome}
              </p>
              <p className="text-sm text-soil">Calculadoras da mangueira</p>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-leaf text-field desk:hidden"
              aria-label="Voltar ao início"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 5 8 12l7 7" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="break-words font-display text-lg font-semibold leading-tight text-field desk:text-2xl">
                {title}
              </p>
              <p className="hidden truncate text-sm text-soil desk:block">{propriedade?.nome}</p>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/meus-dados"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-mango text-sm font-bold text-white"
            aria-label="Meus dados"
          >
            {inicial(nomeAvatar)}
          </Link>
        </div>
      </div>
    </header>
  )
}
