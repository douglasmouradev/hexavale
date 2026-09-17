/** Convite para a tela inicial — texto, sem ícone Lucide. */
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useInstalarPwa } from '@/hooks/useInstalarPwa'

export function InstalarAppCard() {
  const { mostrarCartao, podeInstalar, ios, instalar } = useInstalarPwa()
  if (!mostrarCartao) return null

  return (
    <Card className="space-y-3">
      <div>
        <p className="font-medium text-field">Instalar no celular</p>
        <p className="mt-1 text-sm text-soil">
          {ios
            ? 'No Safari: Compartilhar → Adicionar à Tela de Início.'
            : 'Fica na tela inicial, sem a barra do navegador.'}
        </p>
      </div>
      {podeInstalar ? (
        <Button full onClick={() => void instalar()}>
          Instalar Hexavale
        </Button>
      ) : null}
    </Card>
  )
}
