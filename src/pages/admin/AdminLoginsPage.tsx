/** Histórico de acesso dos produtores: telefone, propriedade, dia e horário (últimos 500). */
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { adminRequest, type LoginRegistro } from '@/lib/adminApi'
import { formatPhone } from '@/lib/format'

const DIA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function AdminLoginsPage() {
  const [registros, setRegistros] = useState<LoginRegistro[]>([])
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async (telefone: string) => {
    setLoading(true)
    setError('')
    try {
      const query = telefone ? `?telefone=${encodeURIComponent(telefone)}` : ''
      const lista = await adminRequest<LoginRegistro[]>(`/api/admin/logins${query}`)
      setRegistros(Array.isArray(lista) ? lista : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar o histórico.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar('')
  }, [carregar])

  function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void carregar(busca)
  }

  return (
    <div className="min-h-svh bg-cream">
      <AdminHeader subtitulo="Acessos dos produtores ao app" />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5 pb-8 lg:max-w-5xl lg:px-8">
        <form className="flex items-end gap-2" onSubmit={handleBuscar}>
          <div className="min-w-0 flex-1">
            <Input
              label="Buscar por telefone"
              name="buscaTelefone"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              value={busca}
              onChange={(event) => setBusca(formatPhone(event.target.value))}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={loading}>
            Buscar
          </Button>
        </form>

        {error ? <Banner tone="danger">{error}</Banner> : null}

        <p className="text-sm text-soil">
          {loading
            ? 'Carregando…'
            : `${registros.length} ${registros.length === 1 ? 'acesso' : 'acessos'}${
                registros.length === 500 ? ' (mostrando os 500 mais recentes)' : ''
              }`}
        </p>

        {!loading && registros.length === 0 && !error ? (
          <Card>
            <p className="text-sm text-soil">
              Nenhum login registrado ainda. Cada vez que um produtor entra no app, aparece aqui.
            </p>
          </Card>
        ) : null}

        {registros.length > 0 ? (
          <Card className="p-0">
            <div className="divide-y divide-line lg:hidden">
              {registros.map((item) => {
                const data = new Date(item.criado_em)
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums text-ink">{formatPhone(item.telefone)}</p>
                      <p className="truncate text-sm text-soil">{item.propriedade}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-field">{HORA.format(data)}</p>
                      <p className="text-xs tabular-nums text-soil">{DIA.format(data)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <table className="hidden w-full border-collapse text-left text-sm lg:table">
              <thead>
                <tr className="text-xs font-semibold text-soil">
                  <th className="border-b border-line px-4 py-3">Telefone</th>
                  <th className="border-b border-line px-4 py-3">Propriedade</th>
                  <th className="border-b border-line px-4 py-3">Dia</th>
                  <th className="border-b border-line px-4 py-3">Horário</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((item) => {
                  const data = new Date(item.criado_em)
                  return (
                    <tr key={item.id}>
                      <td className="border-b border-line px-4 py-2.5 font-medium tabular-nums text-ink">
                        {formatPhone(item.telefone)}
                      </td>
                      <td className="border-b border-line px-4 py-2.5 text-soil">{item.propriedade}</td>
                      <td className="border-b border-line px-4 py-2.5 tabular-nums">{DIA.format(data)}</td>
                      <td className="border-b border-line px-4 py-2.5 tabular-nums">{HORA.format(data)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
