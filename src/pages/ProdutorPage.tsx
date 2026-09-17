/** Cultura, área (ha) e datas que montam as 42 semanas. */
import { useState, type FormEvent } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTitle } from '@/components/ui/PageTitle'
import { useApp } from '@/context/AppContext'
import { CICLO_SEMANAS } from '@/data/constants'
import { gerarSemanasCiclo } from '@/lib/ciclo'
import { cn } from '@/lib/format'
import type { Cultura } from '@/types/models'

function formatDate(iso: string) {
  return format(parseISO(iso), "dd 'de' MMM yyyy", { locale: ptBR })
}

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
        <Input
          label="Início do manejo"
          type="date"
          name="dataReferencia"
          value={dataReferencia}
          onChange={(event) => {
            setDataReferencia(event.target.value)
            setSaved(false)
          }}
          hint=""
        />
        <Input
          label="Data da colheita"
          type="date"
          name="dataColheita"
          value={dataColheita}
          onChange={(event) => {
            setDataColheita(event.target.value)
            setSaved(false)
          }}
          hint="Se preencher a colheita, as 42 semanas contam de trás para frente."
        />
      </Card>

      {primeiraSemana && ultimaSemana ? (
        <Card className="bg-field/10">
          <p className="text-sm font-bold text-field-dark">Prévia do ciclo de {CICLO_SEMANAS} semanas</p>
          <p className="mt-2 text-sm leading-relaxed text-soil">
            Semana 1: {formatDate(primeiraSemana.dataInicio)} a {formatDate(primeiraSemana.dataFim)}.
            Semana {CICLO_SEMANAS}: {formatDate(ultimaSemana.dataInicio)} a {formatDate(ultimaSemana.dataFim)}.
          </p>
        </Card>
      ) : null}

      {saved ? <Banner>Dados do produtor salvos neste aparelho.</Banner> : null}

      <Button type="submit" full disabled={!cultura}>
        Salvar
      </Button>
    </form>
  )
}
