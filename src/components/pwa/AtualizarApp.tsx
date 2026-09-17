/** Recado quando o PWA baixou uma versão nova e precisa recarregar. */
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Banner } from '@/components/ui/Banner'

export function AtualizarApp() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  if (!needRefresh) return null

  return (
    <div className="border-b border-mango/40 bg-mango/10 px-4 py-2 desk:px-8">
      <Banner tone="warn" role="status" className="border-0 bg-transparent px-0 py-0">
        Tem versão nova do Hexavale.
      </Banner>
      <button
        type="button"
        className="mt-1 text-sm font-semibold text-soil underline"
        onClick={() => void updateServiceWorker(true)}
      >
        Atualizar agora
      </button>
    </div>
  )
}
