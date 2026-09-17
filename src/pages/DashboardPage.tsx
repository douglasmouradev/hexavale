/** Home: semana atual, custo do ciclo e atalho para as ferramentas. */
import { Link } from 'react-router-dom'
import {
  BookMarked,
  CalendarDays,
  ChevronRight,
  Droplets,
  Leaf,
  Shield,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { InstalarAppCard } from '@/components/pwa/InstalarAppCard'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { APP_MODULES, culturaLabel } from '@/data/modules'
import { STORAGE_KEYS } from '@/data/constants'
import { formatCurrency } from '@/lib/format'
import { gerarSemanasCiclo, mesclarSemanas, semanaHoje, totaisCiclo } from '@/lib/ciclo'
import { lerSafras } from '@/lib/safra'
import { readStore } from '@/storage/localStore'
import type { CaldaFormState } from '@/hooks/useCaldaForm'
import type { CicloCultura } from '@/types/models'

const MODULE_ICONS: Record<string, LucideIcon> = {
  '/produtor': Leaf,
  '/calda': Droplets,
  '/insumos': ShoppingBag,
  '/mao-de-obra': Users,
  '/ciclo': CalendarDays,
  '/catalogo': BookMarked,
}

const MODULE_TONES: Record<string, string> = {
  '/produtor': 'bg-field text-white',
  '/calda': 'bg-mango text-white',
  '/insumos': 'bg-cream text-field',
  '/mao-de-obra': 'bg-grape text-white',
  '/ciclo': 'bg-field-light text-white',
  '/catalogo': 'bg-cream text-mango',
}

function saudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDia(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function DashboardPage() {
  const { propriedade, produtor } = useApp()
  const calda = readStore<CaldaFormState>(STORAGE_KEYS.calda)
  const cicloSalvo = readStore<CicloCultura>(STORAGE_KEYS.ciclo)
  const temData = Boolean(produtor.dataColheita || produtor.dataReferencia)
  const geradas = gerarSemanasCiclo({
    dataColheita: produtor.dataColheita,
    dataInicio: produtor.dataReferencia,
    cultura: produtor.cultura,
  })
  const semanas = geradas.length
    ? mesclarSemanas(geradas, cicloSalvo?.semanas ?? [])
    : []
  const atual = semanaHoje(semanas)
  const totais = semanas.length ? totaisCiclo(semanas) : null
  const progresso = atual ? Math.round((atual.numero / 42) * 100) : 0
  const ultimaSafra = lerSafras()[0]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-soil">{saudacao()}</p>
        <h1 className="font-display text-[1.85rem] leading-tight font-bold tracking-tight text-field">
          {propriedade?.nome}
        </h1>
      </div>

      <Card tone="field" className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-mango" />
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-28 w-28 rounded-full bg-mango/20" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-mango-light">
              {atual
                ? `Semana ${atual.numero} de 42`
                : temData
                  ? culturaLabel(produtor.cultura)
                  : 'Ciclo ainda sem data'}
            </p>
            <p className="mt-1 text-2xl font-bold leading-snug text-white">
              {atual
                ? atual.tipoTrabalho
                : temData
                  ? 'Fora das 42 semanas'
                  : 'Defina a data em Produtor'}
            </p>
            {atual ? (
              <p className="mt-1 text-sm text-white/70">
                {formatDia(atual.dataInicio)} a {formatDia(atual.dataFim)}
              </p>
            ) : null}
          </div>
          {atual ? (
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white">
              {progresso}%
            </span>
          ) : null}
        </div>

        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-mango"
            style={{ width: `${atual ? progresso : 0}%` }}
          />
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-xs text-white/70">Custo do ciclo</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatCurrency(totais?.geral ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-xs text-white/70">Última calda</p>
            <p className="mt-1 text-lg font-bold text-white">
              {calda?.resultado
                ? `${calda.resultado.tanquesNecessarios} tanque(s)`
                : '—'}
            </p>
          </div>
        </div>

        <Link
          to={temData ? '/ciclo' : '/produtor'}
          className="relative mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-mango text-sm font-bold text-white"
        >
          {temData ? 'Abrir ciclo' : 'Definir datas'}
        </Link>
      </Card>

      <InstalarAppCard />

      {ultimaSafra ? (
        <Link to="/ciclo" className="block">
          <Card>
            <p className="text-sm font-semibold text-soil">Última safra fechada</p>
            <p className="mt-1 text-lg font-bold text-field">
              {culturaLabel(ultimaSafra.cultura)} · {formatCurrency(ultimaSafra.totais.geral)}
            </p>
            <p className="mt-1 text-sm text-soil">
              {new Date(ultimaSafra.fechadaEm).toLocaleDateString('pt-BR')}
            </p>
          </Card>
        </Link>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-semibold text-soil">Ferramentas</p>
        <div className="overflow-hidden rounded-3xl bg-paper shadow-[0_8px_30px_rgba(23,20,17,0.06)]">
          {APP_MODULES.map((module, index) => {
            const Icon = MODULE_ICONS[module.to] ?? ChevronRight
            return (
              <Link
                key={module.to}
                to={module.to}
                className={`flex items-center gap-3 px-3 py-3 active:bg-cream/80 ${index === 0 ? '' : 'border-t border-black/5'}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${MODULE_TONES[module.to]}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-field">{module.title}</span>
                  <span className="block text-sm leading-snug text-soil">
                    {module.description}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-mango" />
              </Link>
            )
          })}
        </div>
      </div>

      <Link
        to="/meus-dados"
        className="flex items-center gap-3 rounded-3xl bg-paper px-3 py-3 shadow-[0_8px_30px_rgba(23,20,17,0.06)]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-field">
          <Shield className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-field">Meus dados</span>
          <span className="block text-sm leading-snug text-soil">
            Privacidade, exportar ou apagar (LGPD)
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-mango" />
      </Link>
    </div>
  )
}
