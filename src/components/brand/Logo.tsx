import { cn } from '@/lib/format'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 64 }: LogoProps) {
  return (
    <img
      src="/brand/hexavale-mark.png?v=2"
      width={size}
      height={size}
      alt=""
      className={cn('shrink-0 object-contain', className)}
    />
  )
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="leading-none">
      <p
        className={cn(
          'text-[11px] font-semibold tracking-[0.22em] uppercase',
          light ? 'text-mango-light' : 'text-mango',
        )}
      >
        Vale do SF
      </p>
      <p
        className={cn(
          'font-display text-[1.65rem] font-bold tracking-tight',
          light ? 'text-white' : 'text-field',
        )}
      >
        Hexavale
      </p>
    </div>
  )
}
