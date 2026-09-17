/** Casca do produtor: topo, conteúdo, navegação e o aviso LGPD se faltar aceite. */
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { ConsentGate } from '@/components/lgpd/ConsentGate'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col bg-cream">
      <Header />
      <main className="flex-1 px-4 py-5 pb-28">
        <Outlet />
      </main>
      <BottomNav />
      <ConsentGate />
    </div>
  )
}
