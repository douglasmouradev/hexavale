/** Capa das telas públicas: eixo único no celular, duas colunas no desktop. */
import type { ReactNode } from 'react'
import { Wordmark } from '@/components/brand/Logo'
import { cn } from '@/lib/format'

export function AuthShell({
  tone = 'cream',
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  tone?: 'cream' | 'field'
  kicker?: string
  title: ReactNode
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const invert = tone === 'field'

  return (
    <div className={cn('relative min-h-svh lg:grid lg:grid-cols-2', invert ? 'bg-field' : 'bg-cream')}>
      <span className="absolute inset-y-0 left-0 z-10 w-1 bg-mango lg:hidden" aria-hidden />
      <aside
        className={cn(
          'relative hidden flex-col justify-between px-12 py-14 lg:flex',
          invert ? 'bg-field-dark' : 'bg-field',
        )}
      >
        <span className="absolute inset-y-0 left-0 w-1 bg-mango" aria-hidden />
        <div>
          <Wordmark height={36} className="mb-16 brightness-0 invert" />
          {kicker ? (
            <p className="mb-4 text-[13px] font-semibold tracking-[0.16em] text-mango-light">
              {kicker}
            </p>
          ) : null}
          <h1 className="font-display text-[3.15rem] leading-[1.12] font-semibold tracking-[-0.03em] text-white">
            {title}
          </h1>
          <span className="mt-6 block h-px w-10 bg-mango-light/80" aria-hidden />
          {subtitle ? (
            <p className="mt-6 max-w-sm text-[16px] leading-7 text-white/65">{subtitle}</p>
          ) : null}
        </div>
        <p className="text-[13px] font-semibold tracking-[0.12em] text-white/40">
          HexaVale | Gestão que acontece no campo
        </p>
      </aside>

      <div
        className={cn(
          'mx-auto flex min-h-svh w-full max-w-[22.5rem] flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-10 lg:max-w-md lg:justify-center lg:px-10 lg:py-14',
        )}
      >
        <header className="mb-8 text-center lg:hidden">
          <Wordmark
            height={34}
            className={cn('mx-auto mb-8', invert && 'brightness-0 invert')}
          />
          {kicker ? (
            <p
              className={cn(
                'mb-3 text-[13px] font-semibold tracking-[0.16em]',
                invert ? 'text-mango-light' : 'text-mango',
              )}
            >
              {kicker}
            </p>
          ) : null}
          <h1
            className={cn(
              'font-display text-[2.15rem] leading-[1.12] font-semibold tracking-[-0.03em]',
              invert ? 'text-white' : 'text-field',
            )}
          >
            {title}
          </h1>
          <span
            className={cn('mx-auto mt-4 block h-px w-10', invert ? 'bg-mango-light/80' : 'bg-mango')}
            aria-hidden
          />
          {subtitle ? (
            <p
              className={cn(
                'mx-auto mt-4 max-w-[17.5rem] text-[14px] leading-6',
                invert ? 'text-white/65' : 'text-soil/80',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </header>
        <div className="flex-1 lg:flex-none">{children}</div>
        {footer ? <footer className="mt-10">{footer}</footer> : null}
      </div>
    </div>
  )
}
