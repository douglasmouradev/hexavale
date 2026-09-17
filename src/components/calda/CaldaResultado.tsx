/** Resultado da calda: tanques e ranking em barra CSS da paleta. */
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GraficoPizza } from '@/components/ui/GraficoPizza'
import { Metric } from '@/components/ui/Metric'
import { formatQuantidade, type ResultadoCalda } from '@/lib/calda'
import { formatNumber } from '@/lib/format'

interface CaldaResultadoProps {
  resultado: ResultadoCalda
  onExportPdf: () => void
}

export function CaldaResultado({ resultado, onExportPdf }: CaldaResultadoProps) {
  const maior = resultado.insumos[0]

  return (
    <div className="space-y-4">
      <Card tone="field" className="space-y-3">
        <p className="text-sm text-mango-light">Resultado da calda</p>
        <div className="grid grid-cols-2 gap-4">
          <Metric
            invert
            label="Volume da área"
            value={`${formatNumber(resultado.volumeAreaLitros)} L`}
          />
          <Metric invert label="Tanques" value={String(resultado.tanquesNecessarios)} />
        </div>
        <Metric
          invert
          label="Volume a preparar"
          value={`${formatNumber(resultado.volumePrepararLitros)} L`}
        />
        <p className="text-sm text-white/80">
          {resultado.tanqueParcial
            ? `${resultado.tanquesNecessarios > 1 ? `${resultado.tanquesNecessarios - 1} cheio(s) + ` : ''}último tanque com ${formatNumber(resultado.ultimoTanqueLitros ?? resultado.tanqueLitros)} L`
            : `Tanque de ${formatNumber(resultado.tanqueLitros)} L × ${resultado.tanquesNecessarios}`}
        </p>
      </Card>

      {maior ? (
        <Card className="border-l-4 border-mango">
          <p className="text-sm text-soil">Maior consumo</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">
            {maior.nome} · {formatQuantidade(maior.quantidadeTotal, maior.unidadeTotal)}
          </p>
        </Card>
      ) : null}

      <Card className="p-0">
        <div>
          {resultado.insumos.map((insumo) => (
            <div key={insumo.id} className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
              <div>
                <p className="font-medium text-ink">{insumo.nome}</p>
                <p className="text-sm text-soil">
                  {formatNumber(insumo.dose, 3)} {insumo.unidade}
                </p>
              </div>
              <p className="text-right font-medium text-field">
                {formatQuantidade(insumo.quantidadeTotal, insumo.unidadeTotal)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {resultado.insumos.length > 0 ? (
        <Card className="space-y-3">
          <p className="font-medium text-ink">Participação de cada insumo</p>
          <GraficoPizza
            centro="Calda"
            formatValor={(value) => formatNumber(value, 2)}
            fatias={resultado.insumos.map((insumo) => ({
              label: insumo.nome,
              value: insumo.valorRanking,
              detalhe: formatQuantidade(insumo.quantidadeTotal, insumo.unidadeTotal),
            }))}
          />
        </Card>
      ) : null}

      <Button full variant="secondary" onClick={onExportPdf}>
        Exportar PDF
      </Button>
    </div>
  )
}
