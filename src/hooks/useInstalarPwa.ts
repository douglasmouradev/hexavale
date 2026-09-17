/**
 * Instalação do PWA: Chrome dispara beforeinstallprompt; iPhone usa o menu Compartilhar.
 * Em localhost o Chrome também permite instalar depois do build/preview.
 */
import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function jaInstalado() {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = navigator as Navigator & { standalone?: boolean }
  return Boolean(nav.standalone)
}

function ehIos() {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function useInstalarPwa() {
  const [instalado, setInstalado] = useState(jaInstalado)
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const ios = ehIos()

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault()
      setEvento(event as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setInstalado(true)
      setEvento(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!evento) return
    await evento.prompt()
    const choice = await evento.userChoice
    if (choice.outcome === 'accepted') setInstalado(true)
    setEvento(null)
  }, [evento])

  return {
    instalado,
    ios,
    podeInstalar: Boolean(evento),
    mostrarCartao: !instalado && (Boolean(evento) || ios),
    instalar,
  }
}
