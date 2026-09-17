/** Se uma rota quebrar, mostra o erro em vez de tela creme vazia. */
import { Component, type ErrorInfo, type ReactNode } from 'react'

export class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { mensagem: string | null }
> {
  state = { mensagem: null as string | null }

  static getDerivedStateFromError(error: Error) {
    return { mensagem: error.message || 'Erro inesperado.' }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error(error)
  }

  render() {
    if (this.state.mensagem) {
      return (
        <div className="min-h-svh bg-cream px-6 py-10">
          <p className="font-display text-xl font-bold text-field">Não deu para abrir esta tela.</p>
          <p className="mt-2 text-sm text-soil">{this.state.mensagem}</p>
          <button
            type="button"
            className="mt-6 text-sm font-medium text-field"
            onClick={() => window.location.assign('/admin')}
          >
            Abrir o painel de novo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
