import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
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

    setSubmitting(true)
    login({ telefone, nome })
    try {
      await showInterstitial('login')
      navigate('/', { replace: true })
    } catch {
      setSubmitting(false)
      setError('Não foi possível exibir o anúncio. Tente novamente.')
    }
  }

  return (
    <div className="flex min-h-svh items-center bg-cream px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] bg-paper p-6 shadow-[0_20px_60px_rgba(23,20,17,0.08)]">
        <div className="mb-8 text-center">
          <Logo size={72} className="mx-auto" />
          <p className="mt-3 font-display text-[2rem] font-bold tracking-tight text-field">
            Hexavale
          </p>
          <p className="mt-2 text-sm text-soil">Calda, insumos e ciclo no celular.</p>
        </div>

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

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          ) : null}

          <Button type="submit" full disabled={submitting}>
            {submitting ? 'Abrindo...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-soil">Sem senha. Fica neste celular.</p>
        <a
          href="/admin/login"
          className="mt-3 block text-center text-sm font-semibold text-mango"
        >
          Administração
        </a>
      </div>
    </div>
  )
}
