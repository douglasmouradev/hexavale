/** Casca do produtor: topo, conteúdo, navegação e o aviso LGPD se faltar aceite. */
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { SideNav } from '@/components/layout/SideNav'
import { ConsentGate } from '@/components/lgpd/ConsentGate'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col bg-cream desk:mx-0 desk:max-w-none desk:flex-row">
      <SideNav />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-5 pb-28 desk:max-w-6xl desk:px-8 desk:py-8 desk:pb-10">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <ConsentGate />
    </div>
  )
}
