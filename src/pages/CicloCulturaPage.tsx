/**
 * Ciclo da safra por fase (poda, florada, colheita…).
 * Linhas lançadas de Insumos/Diária não são apagadas pelos campos extras.
 */
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DateField } from '@/components/ui/DateField'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { TRABALHOS_CICLO, fasesDaCultura, faseDaSemana } from '@/data/fenologia'
import { culturaLabel } from '@/data/modules'
import { usePersistedState } from '@/hooks/usePersistedState'
import { semanaAlvo } from '@/lib/caderno'
import {
  gerarSemanasCiclo,
  mesclarSemanas,
  totalSemana,
  totaisCiclo,
} from '@/lib/ciclo'
import { cn, formatCurrency, parseDecimal } from '@/lib/format'
import { exportarCicloPdf } from '@/lib/exportarPdf'
import { fecharSafraAtual, lerSafras, produtorAposFechar } from '@/lib/safra'
import { PRODUTOR_PADRAO, type CicloCultura, type MaoDeObraSemana, type SafraArquivada, type SemanaCiclo } from '@/types/models'

function formatDia(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function custoMao(item: MaoDeObraSemana) {
  return item.pessoas * item.diaria * item.dias
}

function insumosLancados(semana: SemanaCiclo) {
  return semana.insumos.filter((item) => item.origem === 'insumos')
}

function custoInsumoManual(semana: SemanaCiclo) {
  return semana.insumos
    .filter((item) => item.origem !== 'insumos')
    .reduce((sum, item) => sum + item.custo, 0)
}

function maoLancada(semana: SemanaCiclo) {
  return semana.maoDeObra.filter((item) => item.origem === 'mao-de-obra')
}

function custoMaoManual(semana: SemanaCiclo) {
  return semana.maoDeObra
    .filter((item) => item.origem !== 'mao-de-obra')
    .reduce((sum, item) => sum + custoMao(item), 0)
}

function custoMaquina(semana: SemanaCiclo) {
  return semana.mecanizacao.reduce((sum, item) => sum + item.horas * item.custoHora, 0)
}

function moneyField(value: number) {
  return value > 0 ? String(value) : ''
}

function chaveFase(inicio: number, fim: number) {
  return `${inicio}-${fim}`
}

function AbrirCicloComData() {
  const { produtor, salvarProdutor } = useApp()
  const [dataColheita, setDataColheita] = useState(produtor.dataColheita ?? '')
  const [dataReferencia, setDataReferencia] = useState(produtor.dataReferencia ?? '')
  const manga = produtor.cultura !== 'uva'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dataColheita && !dataReferencia) return
    salvarProdutor({
      ...produtor,
      cultura: produtor.cultura ?? (manga ? 'manga' : null),
      dataColheita: dataColheita || null,
      dataReferencia: dataReferencia || null,
    })
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="font-bold text-ink">Falta a data do ciclo</p>
        <p className="mt-1 text-sm text-soil">
          {manga
            ? 'Informe a colheita aqui. O caderno de 42 semanas monta na hora; Calcular safra mostra a ação de cada fase.'
            : 'Informe a colheita ou o início do manejo para montar as 42 semanas.'}
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <DateField
          label="Data desejada da colheita"
          name="cicloDataColheita"
          value={dataColheita}
          onChange={setDataColheita}
        />
        {!dataColheita ? (
          <DateField
            label="Início do manejo"
            name="cicloDataReferencia"
            value={dataReferencia}
            onChange={setDataReferencia}
          />
        ) : null}
        <Button type="submit" full disabled={!dataColheita && !dataReferencia}>
          Montar o ciclo
        </Button>
      </form>
      {manga ? (
        <Link to="/safra" className="block">
          <Button type="button" variant="secondary" full>
            Calcular a safra
          </Button>
        </Link>
      ) : null}
    </Card>
  )
}

export function CicloCulturaPage() {
  const { propriedade, produtor, salvarProdutor } = useApp()
  const [ciclo, setCiclo] = usePersistedState<CicloCultura | null>(
    STORAGE_KEYS.ciclo,
    null,
  )
  const [safras, setSafras] = useState(lerSafras)
  const [confirmarFechar, setConfirmarFechar] = useState(false)
  const [avisoFechar, setAvisoFechar] = useState('')
  const [usuarioEscolheuFase, setUsuarioEscolheuFase] = useState(false)
  const [faseAberta, setFaseAberta] = useState<string | null>(null)
  const [usuarioEscolheuSemana, setUsuarioEscolheuSemana] = useState(false)
  const [aberta, setAberta] = useState<number | null>(null)

  const semanas = useMemo(() => {
    const geradas = gerarSemanasCiclo({
      dataColheita: produtor.dataColheita,
      dataInicio: produtor.dataReferencia,
      cultura: produtor.cultura,
    })
    if (!geradas.length) return []
    return mesclarSemanas(geradas, ciclo?.semanas ?? [])
  }, [ciclo?.semanas, produtor.cultura, produtor.dataColheita, produtor.dataReferencia])

  const alvo = useMemo(() => semanaAlvo(semanas), [semanas])
  const fases = useMemo(() => fasesDaCultura(produtor.cultura), [produtor.cultura])
  const faseAlvo = alvo ? faseDaSemana(produtor.cultura, alvo.numero) : null
  const chaveAlvo = faseAlvo ? chaveFase(faseAlvo.inicio, faseAlvo.fim) : null
  const chaveFaseEfetiva = usuarioEscolheuFase ? faseAberta : chaveAlvo
  const abertaAgoraNumero = usuarioEscolheuSemana ? aberta : (alvo?.numero ?? aberta)

  function persistir(next: SemanaCiclo[]) {
    setCiclo({
      id: ciclo?.id ?? 'ciclo-atual',
      cultura: produtor.cultura,
      dataInicio: produtor.dataReferencia,
      dataColheita: produtor.dataColheita,
      semanas: next,
      atualizadoEm: new Date().toISOString(),
    })
  }

  function atualizar(numero: number, patch: Partial<SemanaCiclo>) {
    persistir(
      semanas.map((semana) =>
        semana.numero === numero ? { ...semana, ...patch } : semana,
      ),
    )
  }

  const totais = totaisCiclo(semanas)

  function handleFecharSafra() {
    if (!confirmarFechar) {
      setConfirmarFechar(true)
      return
    }
    const result = fecharSafraAtual(produtor)
    if (!result.ok) {
      setAvisoFechar('Defina a data do ciclo em Produtor para fechar a safra.')
      setConfirmarFechar(false)
      return
    }
    setCiclo(null)
    salvarProdutor(produtorAposFechar(produtor))
    setSafras(lerSafras())
    setConfirmarFechar(false)
    setAvisoFechar(`Safra guardada · ${formatCurrency(result.safra.totais.geral)}`)
  }

  if (!semanas.length) {
    return (
      <div className="space-y-4">
        {avisoFechar ? <Banner>{avisoFechar}</Banner> : null}
        <AbrirCicloComData />
        <CompararSafras safras={safras} />
        <ListaSafras safras={safras} propriedade={propriedade} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
      <Card tone="field" className="space-y-4">
        <p className="text-sm font-medium text-mango-light">Safra · 42 semanas</p>
        {produtor.cultura !== 'uva' ? (
          <p className="text-sm text-white/80">
            Caderno semanal.{' '}
            <Link to="/safra" className="text-mango-light underline decoration-mango-light/50">
              Datas da safra
            </Link>
          </p>
        ) : null}
        <p className="font-display text-2xl font-bold text-white">{formatCurrency(totais.geral)}</p>
        {alvo ? (
          <p className="text-sm text-white/80">
            Agora: semana {alvo.numero} · {alvo.tipoTrabalho}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/mao-de-obra" className="block">
            <Button full variant="secondary">
              Lançar diária
            </Button>
          </Link>
          <Link to="/insumos" className="block">
            <Button full variant="outline" className="border-white/30 bg-white/10 text-white">
              Lançar insumo
            </Button>
          </Link>
        </div>
        {alvo ? (
          <Button
            full
            variant="ghost"
            className="text-mango-light"
            onClick={() => {
              setUsuarioEscolheuFase(true)
              setFaseAberta(chaveAlvo)
              setUsuarioEscolheuSemana(true)
              setAberta(alvo.numero)
              window.setTimeout(() => {
                document.getElementById('semana-atual')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }, 50)
            }}
          >
            Ir para a semana de hoje
          </Button>
        ) : null}
        {totais.geral > 0 ? (
          <GraficoPizza
            invert
            centro={formatCurrency(totais.geral)}
            formatValor={formatCurrency}
            fatias={[
              { label: 'Insumos', value: totais.insumos },
              { label: 'Mão de obra', value: totais.maoDeObra },
              { label: 'Máquinas', value: totais.mecanizacao },
            ]}
          />
        ) : (
          <p className="text-sm text-white/80">
            Insumos {formatCurrency(totais.insumos)} · Mão de obra{' '}
            {formatCurrency(totais.maoDeObra)} · Máquinas {formatCurrency(totais.mecanizacao)}
          </p>
        )}
      </Card>

      {totais.geral > 0 ? (
        <Card className="hidden space-y-3 lg:block">
          <p className="font-medium text-ink">Custo por fase</p>
          <GraficoPizza
            centro="Fases"
            formatValor={formatCurrency}
            fatias={fases.map((fase) => ({
              label: fase.titulo,
              value: semanas
                .filter((semana) => semana.numero >= fase.inicio && semana.numero <= fase.fim)
                .reduce((sum, semana) => sum + totalSemana(semana), 0),
            }))}
          />
        </Card>
      ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      {fases.map((fase) => {
        const chave = chaveFase(fase.inicio, fase.fim)
        const daFase = semanas.filter(
          (semana) => semana.numero >= fase.inicio && semana.numero <= fase.fim,
        )
        const totalFase = daFase.reduce((sum, semana) => sum + totalSemana(semana), 0)
        const comCusto = daFase.filter((semana) => totalSemana(semana) > 0).length
        const expandida = chaveFaseEfetiva === chave
        const ehAgora = chaveAlvo === chave

        return (
          <Card key={chave} className={cn('space-y-3 p-4', expandida && 'lg:col-span-2')}>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => {
                setUsuarioEscolheuFase(true)
                setFaseAberta(expandida ? null : chave)
              }}
            >
              <span>
                <span className="block font-bold text-ink">
                  {fase.titulo}
                  {ehAgora ? ' · Agora' : ''}
                </span>
                <span className="text-sm text-soil">
                  Semanas {fase.inicio} a {fase.fim}
                  {comCusto ? ` · ${comCusto} com custo` : ''}
                </span>
              </span>
              <span className="font-bold text-field-dark">{formatCurrency(totalFase)}</span>
            </button>

            {expandida
              ? daFase.map((semana) => (
                  <SemanaEditor
                    key={semana.numero}
                    semana={semana}
                    atual={alvo?.numero === semana.numero}
                    aberta={abertaAgoraNumero === semana.numero}
                    onToggle={() => {
                      setUsuarioEscolheuSemana(true)
                      setAberta(
                        abertaAgoraNumero === semana.numero ? null : semana.numero,
                      )
                    }}
                    onAtualizar={(patch) => atualizar(semana.numero, patch)}
                  />
                ))
              : null}
          </Card>
        )
      })}
      </div>

      <Button
        variant="secondary"
        full
        onClick={() => exportarCicloPdf(semanas, totais, propriedade, produtor)}
      >
        Exportar PDF
      </Button>
      {avisoFechar ? <Banner>{avisoFechar}</Banner> : null}
      <Button variant="outline" full onClick={handleFecharSafra}>
        {confirmarFechar
          ? 'Confirmar: guardar e começar safra nova'
          : 'Fechar safra'}
      </Button>
      {confirmarFechar ? (
        <p className="text-sm text-soil">
          Guarda o custo destas 42 semanas. Depois, defina as datas da próxima colheita em
          Produtor.
        </p>
      ) : null}
      <CompararSafras safras={safras} />
      <ListaSafras safras={safras} propriedade={propriedade} />
    </div>
  )
}

function rotuloSafra(safra: SafraArquivada) {
  const periodo = safra.dataColheita || safra.dataInicio
  return `${culturaLabel(safra.cultura)}${periodo ? ` · ${formatDia(periodo)}` : ''}`
}

function CompararSafras({ safras }: { safras: SafraArquivada[] }) {
  if (safras.length < 2) return null
  const recente = safras[0]!
  const anterior = safras[1]!
  const linhas = [
    { label: 'Total', a: recente.totais.geral, b: anterior.totais.geral },
    { label: 'Insumos', a: recente.totais.insumos, b: anterior.totais.insumos },
    { label: 'Mão de obra', a: recente.totais.maoDeObra, b: anterior.totais.maoDeObra },
    { label: 'Máquinas', a: recente.totais.mecanizacao, b: anterior.totais.mecanizacao },
  ]

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold text-soil">Comparar as duas últimas safras</p>
      <p className="text-sm text-soil">
        {rotuloSafra(recente)} × {rotuloSafra(anterior)}
      </p>
      {linhas.map((linha) => {
        const delta = linha.a - linha.b
        return (
          <div key={linha.label} className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
            <span className="text-sm text-soil">{linha.label}</span>
            <span className="text-right">
              <span className="block font-medium text-ink">
                {formatCurrency(linha.a)} → {formatCurrency(linha.b)}
              </span>
              <span className="text-sm text-soil">
                {delta === 0
                  ? 'Igual'
                  : `${delta > 0 ? '+' : '−'} ${formatCurrency(Math.abs(delta))}`}
              </span>
            </span>
          </div>
        )
      })}
    </Card>
  )
}

function ListaSafras({
  safras,
  propriedade,
}: {
  safras: SafraArquivada[]
  propriedade: ReturnType<typeof useApp>['propriedade']
}) {
  const [aberta, setAberta] = useState<string | null>(null)
  if (!safras.length) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-soil">Safras anteriores</p>
      {safras.map((safra) => {
        const expandida = aberta === safra.id
        const periodo = safra.dataColheita || safra.dataInicio
        return (
          <Card key={safra.id} className="space-y-3 p-4">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => setAberta(expandida ? null : safra.id)}
            >
              <span>
                <span className="block font-bold text-ink">
                  {culturaLabel(safra.cultura)}
                  {periodo ? ` · ${formatDia(periodo)}` : ''}
                </span>
                <span className="text-sm text-soil">
                  Fechada em {new Date(safra.fechadaEm).toLocaleDateString('pt-BR')}
                </span>
              </span>
              <span className="font-bold text-field-dark">
                {formatCurrency(safra.totais.geral)}
              </span>
            </button>
            {expandida ? (
              <div className="space-y-3 border-t border-line pt-3">
                {safra.totais.geral > 0 ? (
                  <GraficoPizza
                    centro={formatCurrency(safra.totais.geral)}
                    formatValor={formatCurrency}
                    fatias={[
                      { label: 'Insumos', value: safra.totais.insumos },
                      { label: 'Mão de obra', value: safra.totais.maoDeObra },
                      { label: 'Máquinas', value: safra.totais.mecanizacao },
                    ]}
                  />
                ) : (
                  <p className="text-sm text-soil">
                    Insumos {formatCurrency(safra.totais.insumos)} · Mão de obra{' '}
                    {formatCurrency(safra.totais.maoDeObra)} · Máquinas{' '}
                    {formatCurrency(safra.totais.mecanizacao)}
                  </p>
                )}
                <Button
                  variant="outline"
                  full
                  onClick={() =>
                    exportarCicloPdf(safra.semanas, safra.totais, propriedade, {
                      ...PRODUTOR_PADRAO,
                      cultura: safra.cultura,
                      dataReferencia: safra.dataInicio,
                      dataColheita: safra.dataColheita,
                    })
                  }
                >
                  Exportar PDF desta safra
                </Button>
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

function SemanaEditor({
  semana,
  atual,
  aberta,
  onToggle,
  onAtualizar,
}: {
  semana: SemanaCiclo
  atual: boolean
  aberta: boolean
  onToggle: () => void
  onAtualizar: (patch: Partial<SemanaCiclo>) => void
}) {
  const parcial = totalSemana(semana)
  const lancados = insumosLancados(semana)
  const diarias = maoLancada(semana)

  return (
    <div
      id={atual ? 'semana-atual' : undefined}
      className="space-y-3 border border-line bg-cream/50 p-3"
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={onToggle}
      >
        <span>
          <span className="block font-bold text-ink">
            Semana {semana.numero} · {semana.tipoTrabalho || 'Sem lançamento'}
          </span>
          <span className="text-sm text-soil">
            {formatDia(semana.dataInicio)} a {formatDia(semana.dataFim)}
            {atual ? ' · Esta semana' : ''}
          </span>
        </span>
        <span className="font-bold text-field-dark">{formatCurrency(parcial)}</span>
      </button>

      {aberta ? (
        <div className="space-y-3 border-t border-black/5 pt-3">
          <Select
            label="Trabalho"
            name={`trabalho-${semana.numero}`}
            value={semana.tipoTrabalho}
            onChange={(event) => onAtualizar({ tipoTrabalho: event.target.value })}
          >
            {TRABALHOS_CICLO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          {lancados.length ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-soil">Lançado de Insumos</p>
              {lancados.map((item) => (
                <p key={`${item.nome}-${item.custo}`} className="flex justify-between text-sm">
                  <span className="font-semibold text-ink">{item.nome}</span>
                  <span>{formatCurrency(item.custo)}</span>
                </p>
              ))}
            </div>
          ) : null}

          <Input
            label="Insumo extra (R$)"
            name={`insumo-${semana.numero}`}
            inputMode="decimal"
            value={moneyField(custoInsumoManual(semana))}
            onChange={(event) => {
              const custo = parseDecimal(event.target.value) ?? 0
              onAtualizar({
                insumos: [
                  ...insumosLancados(semana),
                  ...(custo > 0
                    ? [
                        {
                          nome: semana.tipoTrabalho || 'Insumo',
                          quantidade: 1,
                          custo,
                          origem: 'manual' as const,
                        },
                      ]
                    : []),
                ],
              })
            }}
          />

          {diarias.length ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-soil">Lançado de Diária</p>
              {diarias.map((item) => (
                <p
                  key={`${item.descricao}-${custoMao(item)}`}
                  className="flex justify-between text-sm"
                >
                  <span className="font-semibold text-ink">{item.descricao}</span>
                  <span>{formatCurrency(custoMao(item))}</span>
                </p>
              ))}
            </div>
          ) : null}

          <Input
            label="Mão de obra extra (R$)"
            name={`mo-${semana.numero}`}
            inputMode="decimal"
            value={moneyField(custoMaoManual(semana))}
            onChange={(event) => {
              const custo = parseDecimal(event.target.value) ?? 0
              onAtualizar({
                maoDeObra: [
                  ...maoLancada(semana),
                  ...(custo > 0
                    ? [
                        {
                          descricao: semana.tipoTrabalho || 'Mão de obra',
                          pessoas: 1,
                          diaria: custo,
                          dias: 1,
                          origem: 'manual' as const,
                        },
                      ]
                    : []),
                ],
              })
            }}
          />
          <Input
            label="Máquina (R$)"
            name={`maq-${semana.numero}`}
            inputMode="decimal"
            value={moneyField(custoMaquina(semana))}
            onChange={(event) =>
              onAtualizar({
                mecanizacao: [
                  {
                    descricao: 'Trator / pulverizador',
                    horas: 1,
                    custoHora: parseDecimal(event.target.value) ?? 0,
                  },
                ],
              })
            }
          />
        </div>
      ) : null}
    </div>
  )
}
