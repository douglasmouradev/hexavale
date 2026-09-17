/** Topo sólido (sem vidro). Celular: imagotipo em casa. Desktop: nome da propriedade. */
import { useLocation, useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { ChipCultura } from '@/components/ui/Chip'
import { useApp } from '@/context/AppContext'

const TITLES: Record<string, string> = {
  '/': 'Início',
  '/produtor': 'Produtor',
  '/calda': 'Calda',
  '/custo-calda': 'Custo da calda',
  '/regulador': 'Regulador',
  '/calendario': 'Calendário',
  '/insumos': 'Insumos',
  '/mao-de-obra': 'Mão de obra',
  '/ciclo': 'Ciclo',
  '/catalogo': 'Catálogo',
  '/meus-dados': 'Meus dados',
}

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { propriedade, produtor, logout } = useApp()
  const isHome = pathname === '/'
  const title = TITLES[pathname] ?? 'Hexavale'

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-2.5 desk:max-w-6xl desk:px-8 desk:py-3.5">
        {isHome ? (
          <>
            <div className="min-w-0 flex-1 desk:hidden">
              <Wordmark height={26} />
            </div>
            <div className="hidden min-w-0 flex-1 desk:block">
              <p className="font-display truncate text-2xl font-semibold text-field">
                {propriedade?.nome}
              </p>
              <p className="truncate text-sm text-soil">Caderno desta safra</p>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-field desk:hidden"
              aria-label="Voltar"
            >
              Voltar
            </button>
            <div className="min-w-0">
              <p className="font-display truncate text-xl font-semibold text-field desk:text-2xl">
                {title}
              </p>
              <p className="truncate text-sm text-soil">{propriedade?.nome}</p>
            </div>
          </div>
        )}

        <ChipCultura cultura={produtor.cultura} />
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="text-sm font-medium text-soil"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
