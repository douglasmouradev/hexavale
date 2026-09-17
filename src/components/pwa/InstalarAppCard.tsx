/** Convite para colocar o Hexavale na tela inicial do celular. */
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useInstalarPwa } from '@/hooks/useInstalarPwa'

export function InstalarAppCard() {
  const { mostrarCartao, podeInstalar, ios, instalar } = useInstalarPwa()
  if (!mostrarCartao) return null

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-field text-white">
          <Smartphone className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <p className="font-bold text-field">Instalar no celular</p>
          <p className="mt-1 text-sm leading-snug text-soil">
            {ios
              ? 'No Safari: toque em Compartilhar e depois em Adicionar à Tela de Início.'
              : 'Fica na tela inicial e abre sem a barra do navegador.'}
          </p>
        </div>
      </div>
      {podeInstalar ? (
        <Button full onClick={() => void instalar()}>
          Instalar Hexavale
        </Button>
      ) : null}
    </Card>
  )
}
