/** Número de destaque (custo, tanques, semana). */
export function Metric({
  label,
  value,
  hint,
  invert = false,
}: {
  label: string
  value: string
  hint?: string
  invert?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className={invert ? 'text-xs leading-snug text-white/70' : 'text-xs leading-snug text-soil'}>
        {label}
      </p>
      <p
        className={
          invert
            ? 'mt-0.5 break-words font-display text-[1.35rem] font-semibold leading-tight text-white'
            : 'mt-0.5 break-words font-display text-[1.35rem] font-semibold leading-tight text-field'
        }
      >
        {value}
      </p>
      {hint ? (
        <p className={invert ? 'mt-0.5 text-xs leading-snug text-white/60' : 'mt-0.5 text-xs leading-snug text-soil'}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
