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
      <h2 className="font-display hidden text-[1.7rem] leading-[1.2] font-semibold text-field desk:block">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-soil desk:mt-1">{subtitle}</p> : null}
    </div>
  )
}
