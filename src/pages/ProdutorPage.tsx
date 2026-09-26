/** Cultura, área (ha) e datas que montam as 42 semanas. */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
  const [nomeResponsavel, setNomeResponsavel] = useState(produtor.nomeResponsavel ?? '')
  const [municipio, setMunicipio] = useState(produtor.municipio ?? '')
  const [talhoes, setTalhoes] = useState(produtor.talhoes ?? '')
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    salvarProdutor({
      ...produtor,
      cultura,
      dataReferencia: dataReferencia || null,
      dataColheita: dataColheita || null,
      areaHectares: areaHectares.trim() || null,
      nomeResponsavel: nomeResponsavel.trim() || null,
      municipio: municipio.trim() || null,
      talhoes: talhoes.trim() || null,
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
        <DateField
          label="Data desejada da colheita"
          name="dataColheita"
          value={dataColheita}
          onChange={(iso) => {
            setDataColheita(iso)
            setSaved(false)
          }}
          hint={
            cultura === 'uva'
              ? 'Com a colheita, as 42 semanas contam de trás para frente.'
              : 'A mangueira conta poda, vegetativo, indução e floração a partir desta data.'
          }
        />
        {!dataColheita ? (
          <DateField
            label="Início do manejo"
            name="dataReferencia"
            value={dataReferencia}
            onChange={(iso) => {
              setDataReferencia(iso)
              setSaved(false)
            }}
            hint="Use se ainda não souber o dia da colheita."
          />
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
        <Input
          label="Quem responde pela safra"
          name="nomeResponsavel"
          autoComplete="name"
          placeholder="Seu nome"
          value={nomeResponsavel}
          onChange={(event) => {
            setNomeResponsavel(event.target.value)
            setSaved(false)
          }}
        />
        <Input
          label="Município"
          name="municipio"
          autoComplete="address-level2"
          placeholder="Petrolina"
          value={municipio}
          onChange={(event) => {
            setMunicipio(event.target.value)
            setSaved(false)
          }}
        />
        <Input
          label="Talhões"
          name="talhoes"
          inputMode="numeric"
          placeholder="6"
          value={talhoes}
          onChange={(event) => {
            setTalhoes(event.target.value)
            setSaved(false)
          }}
        />
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
      {saved && (dataColheita || dataReferencia) && cultura !== 'uva' ? (
        <Link to="/safra" className="block">
          <Button type="button" variant="secondary" full>
            Calcular a safra
          </Button>
        </Link>
      ) : null}
      {saved && (dataColheita || dataReferencia) ? (
        <Link to="/ciclo" className="block">
          <Button type="button" variant="outline" full>
            Abrir ciclo de 42 semanas
          </Button>
        </Link>
      ) : null}

      <StickyAction>
        <Button type="submit" full disabled={!cultura || (!dataColheita && !dataReferencia)}>
          Salvar
        </Button>
      </StickyAction>
    </form>
  )
}
