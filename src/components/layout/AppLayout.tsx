/** Casca do produtor: topo, conteúdo, navegação e o aviso LGPD se faltar aceite. */
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { CadernoAviso } from '@/components/layout/CadernoAviso'
import { Header } from '@/components/layout/Header'
import { SideNav } from '@/components/layout/SideNav'
import { ConsentGate } from '@/components/lgpd/ConsentGate'
import { useAds } from '@/context/AdContext'
import { adSessaoJaMostrada, marcarAdSessao } from '@/lib/ads'

export function AppLayout() {
  const { showInterstitial } = useAds()

  useEffect(() => {
    if (adSessaoJaMostrada()) return
    void showInterstitial('login').then((mostrou) => {
      if (mostrou) marcarAdSessao()
    })
  }, [showInterstitial])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col overflow-x-clip bg-cream desk:mx-0 desk:max-w-none desk:flex-row">
      <SideNav />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col overflow-x-clip">
        <Header />
        <CadernoAviso />
        <main className="mx-auto w-full min-w-0 max-w-lg flex-1 overflow-x-clip px-4 py-4 pb-32 desk:max-w-6xl desk:px-8 desk:py-8 desk:pb-10">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <ConsentGate />
    </div>
  )
}
