/** Cultura, área (ha) e datas que montam as 42 semanas. */
import { useState, type FormEvent } from 'react'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { StickyAction } from '@/components/layout/StickyAction'
import { PageTitle } from '@/components/ui/PageTitle'
import { useApp } from '@/context/AppContext'
import { CICLO_SEMANAS } from '@/data/constants'
import { gerarSemanasCiclo } from '@/lib/ciclo'
import { cn, formatDiaPorExtenso } from '@/lib/format'
import type { Cultura } from '@/types/models'

export function ProdutorPage() {
  const { produtor, salvarProdutor } = useApp()
  const [cultura, setCultura] = useState<Cultura | null>(produtor.cultura)
  const [dataReferencia, setDataReferencia] = useState(produtor.dataReferencia ?? '')
  const [dataColheita, setDataColheita] = useState(produtor.dataColheita ?? '')
  const [areaHectares, setAreaHectares] = useState(produtor.areaHectares ?? '')
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    salvarProdutor({
      cultura,
      dataReferencia: dataReferencia || null,
      dataColheita: dataColheita || null,
      areaHectares: areaHectares.trim() || null,
    })
    setSaved(true)
  }

  const previewCiclo = dataColheita
    ? gerarSemanasCiclo({ dataColheita, cultura })
    : dataReferencia
      ? gerarSemanasCiclo({ dataInicio: dataReferencia, cultura })
      : null
  const primeiraSemana = previewCiclo?.[0]
  const ultimaSemana = previewCiclo?.[previewCiclo.length - 1]

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageTitle title="Cultura" subtitle="Manga ou uva desta propriedade." />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setCultura('manga')
            setSaved(false)
          }}
          className={cn(
            'min-h-24 rounded-leaf border px-4 py-5 text-left font-display text-2xl font-bold',
            cultura === 'manga'
              ? 'border-mango bg-mango text-white'
              : 'border-line bg-paper text-field',
          )}
        >
          Manga
        </button>
        <button
          type="button"
          onClick={() => {
            setCultura('uva')
            setSaved(false)
          }}
          className={cn(
            'min-h-24 rounded-leaf border px-4 py-5 text-left font-display text-2xl font-bold',
            cultura === 'uva'
              ? 'border-grape bg-grape text-white'
              : 'border-line bg-paper text-field',
          )}
        >
          Uva
        </button>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
        <Input
          label="Área (ha)"
          name="areaHectares"
          inputMode="decimal"
          placeholder="10"
          value={areaHectares}
          onChange={(event) => {
            setAreaHectares(event.target.value)
            setSaved(false)
          }}
          hint="Usada na calda, se o campo de área estiver vazio."
        />
        <DateField
          label="Início do manejo"
          name="dataReferencia"
          value={dataReferencia}
          onChange={(iso) => {
            setDataReferencia(iso)
            setSaved(false)
          }}
        />
        <DateField
          label="Data da colheita"
          name="dataColheita"
          value={dataColheita}
          onChange={(iso) => {
            setDataColheita(iso)
            setSaved(false)
          }}
          hint="Se preencher a colheita, as 42 semanas contam de trás para frente."
        />
        </div>
      </Card>

      {primeiraSemana && ultimaSemana ? (
        <Card className="bg-field/10">
          <p className="text-sm font-bold text-field-dark">Prévia do ciclo de {CICLO_SEMANAS} semanas</p>
          <p className="mt-2 text-sm leading-relaxed text-soil">
            Semana 1: {formatDiaPorExtenso(primeiraSemana.dataInicio)} a {formatDiaPorExtenso(primeiraSemana.dataFim)}.
            Semana {CICLO_SEMANAS}: {formatDiaPorExtenso(ultimaSemana.dataInicio)} a {formatDiaPorExtenso(ultimaSemana.dataFim)}.
          </p>
        </Card>
      ) : null}

      {saved ? <Banner>Dados do produtor salvos neste aparelho.</Banner> : null}

      <StickyAction>
        <Button type="submit" full disabled={!cultura}>
          Salvar
        </Button>
      </StickyAction>
    </form>
  )
}
