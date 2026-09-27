/** Login local: telefone + propriedade + checkbox. Capa de caderno, sem cartão flutuante. */
import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/layout/AuthShell'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAds } from '@/context/AdContext'
import { useApp } from '@/context/AppContext'
import { formatPhone, isValidPhone } from '@/lib/format'
import { marcarAdSessao } from '@/lib/ads'
import { registrarLogin } from '@/lib/adminApi'

export function LoginPage() {
  const { propriedade, login } = useApp()
  const { showInterstitial } = useAds()
  const navigate = useNavigate()
  const [telefone, setTelefone] = useState('')
  const [nome, setNome] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aceite, setAceite] = useState(false)
  const loginEmCurso = useRef(false)

  if (propriedade && !loginEmCurso.current && !submitting) {
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
    loginEmCurso.current = true
    try {
      const mostrou = await showInterstitial('login')
      if (mostrou) marcarAdSessao()
    } catch {
      // Segue mesmo se o anúncio não abrir.
    }
    login({ telefone, nome })
    void registrarLogin(telefone, nome.trim())
    navigate('/', { replace: true })
  }

  return (
    <AuthShell
      kicker="Produtor"
      title={
        <>
          A safra
          <br />
          neste celular
        </>
      }
      subtitle="Safra, PBZ, calda orgânica e tratos. O caderno fica só neste aparelho."
      footer={
        <p className="text-center text-[13px] font-semibold tracking-[0.04em] text-soil/70">
          <Link to="/admin/login" className="text-field">
            Painel de vídeos
          </Link>
        </p>
      }
    >
      <form className="space-y-5 rounded-leaf bg-paper p-5 shadow-lift" onSubmit={handleSubmit}>
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

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-field"
            checked={aceite}
            onChange={(event) => setAceite(event.target.checked)}
          />
          <span className="text-[13px] leading-5 text-soil">
            Li e aceito a{' '}
            <Link to="/privacidade" className="font-semibold text-field underline decoration-mango/60 underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        {error ? <Banner tone="danger">{error}</Banner> : null}

        <Button type="submit" full disabled={submitting}>
          {submitting ? 'Abrindo...' : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  )
}
