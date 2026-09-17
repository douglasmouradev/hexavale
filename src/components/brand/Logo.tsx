/** Folha (isotipo) e nome horizontal da identidade visual. */
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

export function Wordmark({
  className,
  height = 28,
}: {
  className?: string
  height?: number
}) {
  return (
    <img
      src="/brand/hexavale-wordmark.svg"
      alt="Hexavale"
      height={height}
      className={cn('w-auto object-contain object-left', className)}
      style={{ height }}
    />
  )
}
