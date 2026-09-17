/** Login do painel: sala verde, ficha de papel — distinto do produtor. */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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
    <div className="flex min-h-svh items-center bg-field px-4 py-10">
      <Card className="mx-auto w-full max-w-md space-y-5 p-5">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <p className="text-sm text-soil">Painel de vídeos</p>
            <p className="font-display text-2xl font-bold text-field">Hexavale</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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

        <p className="text-center text-sm text-soil">
          <Link to="/privacidade" className="text-field">
            Privacidade
          </Link>
        </p>
      </Card>
    </div>
  )
}
