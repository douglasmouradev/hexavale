/** Resultado da calda: tanques, quantidades e ranking de consumo. */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatQuantidade, type ResultadoCalda } from '@/lib/calda'
import { formatNumber } from '@/lib/format'

interface CaldaResultadoProps {
  resultado: ResultadoCalda
  onExportPdf: () => void
}

export function CaldaResultado({ resultado, onExportPdf }: CaldaResultadoProps) {
  const maior = resultado.insumos[0]
  const chartData = resultado.insumos.map((insumo) => ({
    id: insumo.id,
    nome: insumo.nome,
    quantidade: insumo.valorRanking,
    label: formatQuantidade(insumo.quantidadeTotal, insumo.unidadeTotal),
  }))

  return (
    <div className="space-y-4">
      <Card tone="field" className="space-y-3">
        <p className="text-sm font-bold text-yellow-200">Resultado da calda</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="block font-semibold text-white/90">Volume da área</span>
            <span className="text-lg font-bold text-white">
              {formatNumber(resultado.volumeAreaLitros)} L
            </span>
          </p>
          <p>
            <span className="block font-semibold text-white/90">Tanques</span>
            <span className="text-lg font-bold text-white">{resultado.tanquesNecessarios}</span>
          </p>
          <p className="col-span-2">
            <span className="block font-semibold text-white/90">Volume a preparar</span>
            <span className="text-lg font-bold text-white">
              {formatNumber(resultado.volumePrepararLitros)} L
            </span>
            <span className="mt-1 block font-semibold text-white">
              {resultado.tanqueParcial
                ? `${resultado.tanquesNecessarios > 1 ? `${resultado.tanquesNecessarios - 1} cheio(s) + ` : ''}último tanque com ${formatNumber(resultado.ultimoTanqueLitros ?? resultado.tanqueLitros)} L`
                : `Tanque de ${formatNumber(resultado.tanqueLitros)} L × ${resultado.tanquesNecessarios}`}
            </span>
          </p>
        </div>
      </Card>

      {maior ? (
        <Card className="border-2 border-mango bg-mango/10">
          <p className="text-sm font-bold text-soil">Maior consumo</p>
          <p className="mt-1 text-xl font-bold text-ink">
            {maior.nome} · {formatQuantidade(maior.quantidadeTotal, maior.unidadeTotal)}
          </p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-cream-dark">
          {resultado.insumos.map((insumo) => (
            <div key={insumo.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-bold text-ink">{insumo.nome}</p>
                <p className="text-sm text-soil">
                  {formatNumber(insumo.dose, 3)} {insumo.unidade}
                </p>
              </div>
              <p className="text-right text-lg font-bold text-field-dark">
                {formatQuantidade(insumo.quantidadeTotal, insumo.unidadeTotal)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {chartData.length > 0 ? (
        <Card>
          <p className="mb-3 font-bold text-ink">Ranking de insumos</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={88}
                  tick={{ fontSize: 12, fill: '#3d2914' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const row = payload[0].payload as {
                      nome: string
                      label: string
                    }
                    return (
                      <div className="rounded-xl bg-white px-3 py-2 text-sm shadow">
                        <p className="font-bold text-ink">{row.nome}</p>
                        <p className="text-soil">{row.label}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="quantidade" radius={[0, 8, 8, 0]}>
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.id}
                      fill={index === 0 ? '#e8892c' : '#1f6b3a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      <Button full variant="secondary" onClick={onExportPdf}>
        Exportar PDF
      </Button>
    </div>
  )
}
