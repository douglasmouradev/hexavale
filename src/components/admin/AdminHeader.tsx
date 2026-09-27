/** Topo do painel: abas Propagandas e Histórico de login, com Sair. */
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { clearAdminToken } from '@/lib/adminApi'
import { cn } from '@/lib/format'

const ABAS = [
  { to: '/admin', label: 'Propagandas', end: true },
  { to: '/admin/logins', label: 'Histórico de login', end: false },
]

export function AdminHeader({ subtitulo }: { subtitulo: string }) {
  const navigate = useNavigate()

  return (
    <header className="bg-field text-white">
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 pt-4 lg:max-w-5xl lg:px-8">
        <Logo size={36} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold">Painel</h1>
          <p className="truncate text-sm text-white/70">{subtitulo}</p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-mango-light"
          onClick={() => {
            clearAdminToken()
            navigate('/admin/login', { replace: true })
          }}
        >
          Sair
        </button>
      </div>
      <nav className="mx-auto flex w-full max-w-lg gap-1 px-4 pt-3 lg:max-w-5xl lg:px-8">
        {ABAS.map((aba) => (
          <NavLink
            key={aba.to}
            to={aba.to}
            end={aba.end}
            className={({ isActive }) =>
              cn(
                'rounded-t-leaf px-3 py-2.5 text-sm font-semibold',
                isActive ? 'bg-cream text-field' : 'text-white/75 hover:text-white',
              )
            }
          >
            {aba.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
