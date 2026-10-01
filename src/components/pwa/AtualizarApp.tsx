/** Instala a versão nova do PWA sozinho: confere ao abrir, ao voltar para o app e a cada 30 min. */
import { useRegisterSW } from 'virtual:pwa-register/react'

const INTERVALO_CHECAGEM_MS = 30 * 60 * 1000

export function AtualizarApp() {
  useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const checar = () => {
        if (navigator.onLine) void registration.update()
      }
      setInterval(checar, INTERVALO_CHECAGEM_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checar()
      })
    },
  })

  return null
}
