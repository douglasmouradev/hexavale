/** Ponto de entrada: monta o React e marca #root como pronto (o HTML mostra erro se o JS falhar antes). */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { limparCalculos } from '@/hooks/useSessionState'
import { migrarCaderno } from '@/lib/schema'
import App from './App.tsx'
import './index.css'

migrarCaderno()
limparCalculos()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
document.getElementById('root')?.setAttribute('data-ready', '1')
