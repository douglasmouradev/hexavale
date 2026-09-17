/** Login local: telefone + propriedade + checkbox. Sem cartão flutuante. */
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Logo'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { formatPhone, isValidPhone } from '@/lib/format'

export function LoginPage() {
  const { propriedade, login } = useApp()
  const { showInterstitial } = useAds()
  const navigate = useNavigate()
  const [telefone, setTelefone] = useState('')
  const [nome, setNome] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aceite, setAceite] = useState(false)

  if (propriedade && !submitting) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!isValidPhone(telefone)) {
      setError('Informe um telefone válido com DDD.')
      return
    }

    if (nome.trim().length < 2) {
      setError('Informe o nome da propriedade.')
      return
    }

    if (!aceite) {
      setError('Para entrar, aceite a Política de Privacidade.')
      return
    }

    setSubmitting(true)
    login({ telefone, nome })
    try {
      await showInterstitial('login')
    } catch {
      // Segue mesmo se o anúncio não abrir.
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center bg-cream px-4 py-10">
      <Wordmark height={36} className="mb-3" />
      <p className="mb-8 text-sm text-soil">Calda, insumos e ciclo neste celular.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Telefone"
          name="telefone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(event) => setTelefone(formatPhone(event.target.value))}
        />
        <Input
          label="Propriedade"
          name="propriedade"
          autoComplete="organization"
          placeholder="Nome do sítio ou fazenda"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <label className="flex items-start gap-3 border border-line bg-paper px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-field"
            checked={aceite}
            onChange={(event) => setAceite(event.target.checked)}
          />
          <span className="text-sm font-medium text-ink">
            Li e aceito a{' '}
            <Link to="/privacidade" className="text-field underline">
              Política de Privacidade
            </Link>
            . Telefone e nome ficam neste aparelho.
          </span>
        </label>

        {error ? <Banner tone="danger">{error}</Banner> : null}

        <Button type="submit" full disabled={submitting || !aceite}>
          {submitting ? 'Abrindo...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-soil">
        <a href="/admin/login" className="text-field">
          Painel
        </a>
      </p>
    </div>
  )
}
