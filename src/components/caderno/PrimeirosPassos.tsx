/** Primeira safra: cultura, área e data, sem abrir a tela inteira de Produtor. */
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/format'
import type { Cultura } from '@/types/models'

export function PrimeirosPassos() {
  const { produtor, salvarProdutor } = useApp()
  const [cultura, setCultura] = useState<Cultura | null>(produtor.cultura)
  const [areaHectares, setAreaHectares] = useState(produtor.areaHectares ?? '')
  const [dataColheita, setDataColheita] = useState(produtor.dataColheita ?? '')
  const [dataReferencia, setDataReferencia] = useState(produtor.dataReferencia ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cultura) return
    salvarProdutor({
      cultura,
      areaHectares: areaHectares.trim() || null,
      dataColheita: dataColheita || null,
      dataReferencia: dataReferencia || null,
    })
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="font-display text-xl font-semibold text-field">Comece a safra</p>
        <p className="mt-1 text-sm text-soil">
          Cultura e uma data. O caderno de 42 semanas monta sozinho.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCultura('manga')}
            className={cn(
              'min-h-16 rounded-leaf border px-3 py-3 text-left font-display text-lg font-semibold',
              cultura === 'manga'
                ? 'border-mango bg-mango text-white'
                : 'border-line bg-paper text-field',
            )}
          >
            Manga
          </button>
          <button
            type="button"
            onClick={() => setCultura('uva')}
            className={cn(
              'min-h-16 rounded-leaf border px-3 py-3 text-left font-display text-lg font-semibold',
              cultura === 'uva'
                ? 'border-grape bg-grape text-white'
                : 'border-line bg-paper text-field',
            )}
          >
            Uva
          </button>
        </div>
        <Input
          label="Área (ha)"
          name="areaHectares"
          inputMode="decimal"
          placeholder="10"
          value={areaHectares}
          onChange={(event) => setAreaHectares(event.target.value)}
        />
        <DateField
          label="Data da colheita"
          name="dataColheita"
          value={dataColheita}
          onChange={setDataColheita}
          hint="Se ainda não souber a colheita, informe o início do manejo."
        />
        {!dataColheita ? (
          <DateField
            label="Início do manejo"
            name="dataReferencia"
            value={dataReferencia}
            onChange={setDataReferencia}
          />
        ) : null}
        <Button type="submit" full disabled={!cultura || (!dataColheita && !dataReferencia)}>
          Abrir o caderno
        </Button>
      </form>
    </Card>
  )
}
