/** Marca HexaVale (folha). */
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
