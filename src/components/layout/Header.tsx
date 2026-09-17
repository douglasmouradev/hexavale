/** Barra superior: título da tela, cultura e Sair (não apaga o caderno). */
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { useApp } from '@/context/AppContext'
import { culturaLabel } from '@/data/modules'
import { cn } from '@/lib/format'

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
  const uva = produtor.cultura === 'uva'

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-2.5">
        {isHome ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Logo size={36} />
            <div className="min-w-0 leading-none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-mango uppercase">
                Vale do SF
              </p>
              <p className="font-display truncate text-lg font-bold text-field">
                Hexavale
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-lg text-field"
              aria-label="Voltar"
            >
              ←
            </button>
            <div className="min-w-0">
              <p className="font-display truncate text-xl font-bold text-field">{title}</p>
              <p className="truncate text-sm text-soil">{propriedade?.nome}</p>
            </div>
          </div>
        )}

        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold text-white',
            uva ? 'bg-grape' : 'bg-mango',
          )}
        >
          {culturaLabel(produtor.cultura)}
        </span>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="rounded-full bg-cream px-3 py-1.5 text-sm font-semibold text-soil"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
