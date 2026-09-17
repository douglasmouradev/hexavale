/** Edita o catálogo: produtos de Insumos e receita da Calda. */
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency, parseDecimal } from '@/lib/format'
import {
  lerCatalogo,
  removerProdutoCalda,
  removerProdutoInsumo,
} from '@/lib/catalogo'
import type { CatalogoCaderno } from '@/types/models'

export function CatalogoPage() {
  const [catalogo, setCatalogo] = useState<CatalogoCaderno>(lerCatalogo)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-field">Catálogo</h2>
        <p className="mt-1 text-sm text-soil">
          Produtos guardados neste aparelho. O cálculo atualiza preço e dose sozinho.
        </p>
      </div>

      <Card className="space-y-3">
        <h3 className="font-bold text-ink">Insumos por porte</h3>
        {catalogo.insumos.length === 0 ? (
          <p className="text-sm text-soil">
            Ainda vazio. Calcule em Insumos com nome e preço para guardar.
          </p>
        ) : (
          catalogo.insumos.map((item) => {
            const preco = parseDecimal(item.preco)
            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-cream/70 px-3 py-3"
              >
                <div>
                  <p className="font-bold text-ink">{item.nome}</p>
                  <p className="text-sm text-soil">
                    {preco === null ? 'Sem preço' : formatCurrency(preco)}
                    {item.doseP || item.doseM || item.doseG
                      ? ` · P ${item.doseP || '0'} · M ${item.doseM || '0'} · G ${item.doseG || '0'}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper"
                  aria-label={`Remover ${item.nome}`}
                  onClick={() => setCatalogo(removerProdutoInsumo(item.id))}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )
          })
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold text-ink">Receita da calda</h3>
        {catalogo.calda.length === 0 ? (
          <p className="text-sm text-soil">
            Ainda vazio. Calcule em Calda com nome e dose para guardar.
          </p>
        ) : (
          catalogo.calda.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-cream/70 px-3 py-3"
            >
              <div>
                <p className="font-bold text-ink">{item.nome}</p>
                <p className="text-sm text-soil">
                  {item.dose || '—'} {item.unidade}
                </p>
              </div>
              <button
                type="button"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper"
                aria-label={`Remover ${item.nome}`}
                onClick={() => setCatalogo(removerProdutoCalda(item.id))}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
