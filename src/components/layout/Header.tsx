/** Topo sólido (sem vidro). Em casa: imagotipo. Nas outras telas: voltar + título. */
import { useLocation, useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { ChipCultura } from '@/components/ui/Chip'
import { useApp } from '@/context/AppContext'

const TITLES: Record<string, string> = {
  '/': 'Início',
  '/produtor': 'Produtor',
  '/calda': 'Calda',
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
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-2.5">
        {isHome ? (
          <div className="min-w-0 flex-1">
            <Wordmark height={26} />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-field"
              aria-label="Voltar"
            >
              Voltar
            </button>
            <div className="min-w-0">
              <p className="font-display truncate text-xl font-bold text-field">{title}</p>
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
