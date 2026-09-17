/** Número de destaque (custo, tanques, semana). */
export function Metric({
  label,
  value,
  invert = false,
}: {
  label: string
  value: string
  invert?: boolean
}) {
  return (
    <div>
      <p className={invert ? 'text-xs text-white/70' : 'text-xs text-soil'}>{label}</p>
      <p
        className={
          invert
            ? 'mt-0.5 font-display text-xl font-bold text-white'
            : 'mt-0.5 font-display text-xl font-bold text-field'
        }
      >
        {value}
      </p>
    </div>
  )
}
