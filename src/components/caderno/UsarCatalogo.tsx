/** Escolhe um produto já salvo e preenche o cálculo. */
import { Select } from '@/components/ui/Select'

export function UsarCatalogo({
  opcoes,
  onEscolher,
}: {
  opcoes: Array<{ id: string; nome: string }>
  onEscolher: (id: string) => void
}) {
  if (!opcoes.length) return null

  return (
    <Select
      label="Do catálogo"
      name={`catalogo-${opcoes[0]?.id ?? 'lista'}`}
      value=""
      onChange={(event) => {
        const id = event.target.value
        if (id) onEscolher(id)
      }}
    >
      <option value="">Escolher produto salvo</option>
      {opcoes.map((item) => (
        <option key={item.id} value={item.id}>
          {item.nome}
        </option>
      ))}
    </Select>
  )
}
