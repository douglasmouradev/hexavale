/** Título de tela: display só aqui; apoio em peso normal. */
export function PageTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div>
      <h2 className="font-display text-[1.7rem] leading-[1.2] font-semibold text-field">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-soil">{subtitle}</p> : null}
    </div>
  )
}
