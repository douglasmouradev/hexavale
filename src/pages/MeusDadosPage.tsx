/** Direitos do titular: ver, exportar, restaurar cópia e apagar tudo neste aparelho. */
import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { POLITICA_VERSAO } from '@/data/lgpd'
import { baixarDadosTitular, lerArquivoPacote, type PacoteTitular } from '@/lib/lgpd'
import { formatPhone } from '@/lib/format'

function formatQuando(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}

export function MeusDadosPage() {
  const { propriedade, produtor, consentimento, apagarMeusDados, restaurarBackup } = useApp()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const [restaurando, setRestaurando] = useState(false)
  const [pendente, setPendente] = useState<PacoteTitular | null>(null)

  function handleApagar() {
    if (!confirmar) {
      setConfirmar(true)
      return
    }
    apagarMeusDados()
    navigate('/login', { replace: true })
  }

  async function handleRestaurar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setErro('')
    setAviso('')
    setPendente(null)
    setRestaurando(true)
    try {
      const pacote = await lerArquivoPacote(file)
      setPendente(pacote)
      setAviso('Cópia lida. Confirme para substituir o caderno deste aparelho.')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível ler o arquivo.')
    } finally {
      setRestaurando(false)
    }
  }

  function confirmarRestaurar() {
    if (!pendente) return
    restaurarBackup(pendente)
    setPendente(null)
    setAviso('Cópia restaurada neste aparelho.')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-field">Seus dados</h2>
        <p className="mt-1 text-sm text-soil">
          Direito de acesso, correção, portabilidade e exclusão (LGPD, art. 18).
        </p>
      </div>

      <Card className="space-y-3">
        <h3 className="font-bold text-ink">Identificação neste aparelho</h3>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Propriedade</span>
          <span className="font-semibold text-ink">{propriedade?.nome ?? '—'}</span>
        </p>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Telefone</span>
          <span className="font-semibold text-ink">
            {propriedade?.telefone ? formatPhone(propriedade.telefone) : '—'}
          </span>
        </p>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Entrada</span>
          <span className="font-semibold text-ink">{formatQuando(propriedade?.loggedAt)}</span>
        </p>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Consentimento</span>
          <span className="text-right font-semibold text-ink">
            {consentimento
              ? `v${consentimento.versao} · ${formatQuando(consentimento.aceitoEm)}`
              : 'Pendente'}
          </span>
        </p>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold text-ink">Caderno (só neste celular)</h3>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Cultura</span>
          <span className="font-semibold text-ink">{produtor.cultura ?? '—'}</span>
        </p>
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-soil">Área (ha)</span>
          <span className="font-semibold text-ink">{produtor.areaHectares ?? '—'}</span>
        </p>
        <p className="text-sm leading-relaxed text-soil">
          Calda, insumos, diária e ciclo também ficam aqui. Corrija em Produtor ou em cada
          ferramenta. Política vigente: versão {POLITICA_VERSAO}.
        </p>
        <Link to="/produtor" className="block text-sm font-semibold text-mango">
          Corrigir dados em Produtor
        </Link>
      </Card>

      <Card className="space-y-3">
        <Button full variant="secondary" onClick={() => baixarDadosTitular()}>
          Exportar cópia (JSON)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleRestaurar}
        />
        <Button
          full
          variant="outline"
          disabled={restaurando}
          onClick={() => fileRef.current?.click()}
        >
          {restaurando ? 'Restaurando...' : 'Restaurar cópia'}
        </Button>
        {aviso ? (
          <p className="rounded-2xl bg-field/10 px-4 py-3 text-sm font-semibold text-field">
            {aviso}
          </p>
        ) : null}
        {pendente ? (
          <Button full onClick={confirmarRestaurar}>
            Confirmar restauração
          </Button>
        ) : null}
        {erro ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {erro}
          </p>
        ) : (
          <p className="text-sm text-soil">
            Restaurar substitui o caderno deste aparelho pela cópia do arquivo.
          </p>
        )}
        <Button full variant="outline" onClick={handleApagar}>
          {confirmar ? 'Toque de novo para apagar tudo' : 'Apagar meus dados'}
        </Button>
        {confirmar ? (
          <p className="text-sm font-semibold text-red-800">
            Isso apaga nome, telefone, caderno e o aceite neste aparelho. Não dá para desfazer.
          </p>
        ) : (
          <p className="text-sm text-soil">
            Sair só tira nome e telefone da sessão. Apagar remove o caderno também.
          </p>
        )}
      </Card>

      <Link to="/privacidade" className="block text-center text-sm font-semibold text-mango">
        Ler a Política de Privacidade
      </Link>
    </div>
  )
}
