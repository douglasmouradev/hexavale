/**
 * Ciclo da safra por fase (poda, florada, colheita…).
 * Linhas lançadas de Insumos/Diária não são apagadas pelos campos extras.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useApp } from '@/context/AppContext'
import { STORAGE_KEYS } from '@/data/constants'
import { TRABALHOS_CICLO, fasesDaCultura, faseDaSemana } from '@/data/fenologia'
import { usePersistedState } from '@/hooks/usePersistedState'
import { semanaAlvo } from '@/lib/caderno'
import {
  gerarSemanasCiclo,
  mesclarSemanas,
  totalSemana,
  totaisCiclo,
} from '@/lib/ciclo'
import { formatCurrency, parseDecimal } from '@/lib/format'
import { exportarCicloPdf } from '@/lib/pdf'
import type { CicloCultura, MaoDeObraSemana, SemanaCiclo } from '@/types/models'

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

export function CicloCulturaPage() {
  const { propriedade, produtor } = useApp()
  const [ciclo, setCiclo] = usePersistedState<CicloCultura | null>(
    STORAGE_KEYS.ciclo,
    null,
  )
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

  if (!semanas.length) {
    return (
      <Card className="space-y-3">
        <p className="font-bold text-ink">Falta a data do ciclo</p>
        <p className="text-sm text-soil">
          Em Produtor, informe a data de manejo ou a data da colheita.
        </p>
        <Link to="/produtor" className="block">
          <Button full>Abrir Produtor</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card tone="field">
        <p className="text-sm font-bold text-yellow-200">Safra · 42 semanas</p>
        <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totais.geral)}</p>
        <p className="mt-2 text-sm font-semibold text-white">
          Insumos {formatCurrency(totais.insumos)} · Mão de obra{' '}
          {formatCurrency(totais.maoDeObra)} · Máquinas {formatCurrency(totais.mecanizacao)}
        </p>
        {alvo ? (
          <p className="mt-2 text-sm text-white/80">
            Agora: semana {alvo.numero} · {alvo.tipoTrabalho}
          </p>
        ) : null}
      </Card>

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
          <Card key={chave} className="space-y-3 p-4">
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

      <Button
        variant="secondary"
        full
        onClick={() => exportarCicloPdf(semanas, totais, propriedade, produtor)}
      >
        Exportar PDF
      </Button>
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
    <div className="space-y-3 rounded-2xl bg-cream/70 p-3">
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
