/** Login do painel: sala verde, ficha de papel — distinto do produtor. */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/layout/AuthShell'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminRequest, setAdminToken } from '@/lib/adminApi'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminRequest<{ token: string }>('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      setAdminToken(data.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      tone="field"
      kicker="Administração"
      title={
        <>
          Vídeos
          <br />
          do anúncio
        </>
      }
      subtitle="Entra quem publica a propaganda que o produtor vê no app."
      footer={
        <p className="text-center text-sm text-white/60">
          <Link to="/login" className="font-medium text-mango-light">
            Voltar ao app
          </Link>
        </p>
      }
    >
      <form className="space-y-5 rounded-leaf bg-paper p-5 shadow-lift" onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
        {error ? <Banner tone="danger">{error}</Banner> : null}
        <Button type="submit" full disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  )
}
