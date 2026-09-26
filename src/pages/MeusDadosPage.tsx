/** Direitos do titular: ver, corrigir talhão, exportar, restaurar e apagar. */
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTitle } from '@/components/ui/PageTitle'
import { Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { POLITICA_VERSAO } from '@/data/lgpd'
import { baixarDadosTitular, compartilharDadosTitular, lerArquivoPacote, type PacoteTitular } from '@/lib/lgpd'
import { formatPhone } from '@/lib/format'

function formatQuando(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}

export function MeusDadosPage() {
  const { propriedade, produtor, consentimento, salvarProdutor, apagarMeusDados, restaurarBackup, logout } =
    useApp()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const [restaurando, setRestaurando] = useState(false)
  const [pendente, setPendente] = useState<PacoteTitular | null>(null)
  const [talhao, setTalhao] = useState({
    nomeResponsavel: produtor.nomeResponsavel ?? '',
    municipio: produtor.municipio ?? '',
    talhoes: produtor.talhoes ?? '',
    areaHectares: produtor.areaHectares ?? '',
  })
  const [salvoTalhao, setSalvoTalhao] = useState(false)

  function handleApagar() {
    if (!confirmar) {
      setConfirmar(true)
      return
    }
    apagarMeusDados()
    navigate('/login', { replace: true })
  }

  function handleSalvarTalhao(event: FormEvent) {
    event.preventDefault()
    salvarProdutor({
      ...produtor,
      cultura: produtor.cultura ?? 'manga',
      nomeResponsavel: talhao.nomeResponsavel.trim() || null,
      municipio: talhao.municipio.trim() || null,
      talhoes: talhao.talhoes.trim() || null,
      areaHectares: talhao.areaHectares.trim() || null,
    })
    setSalvoTalhao(true)
    window.setTimeout(() => setSalvoTalhao(false), 2500)
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
      <PageTitle
        title="Seus dados"
        subtitle="Acesso, correção, cópia e exclusão neste aparelho."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 font-medium text-ink">Neste aparelho</h3>
          <Row label="Propriedade" value={propriedade?.nome ?? '—'} />
          <Row
            label="Telefone"
            value={propriedade?.telefone ? formatPhone(propriedade.telefone) : '—'}
          />
          <Row label="Entrada" value={formatQuando(propriedade?.loggedAt)} />
          <Row
            label="Aceite"
            value={
              consentimento
                ? `v${consentimento.versao} · ${formatQuando(consentimento.aceitoEm)}`
                : 'Pendente'
            }
          />
        </Card>

        <Card>
          <form className="space-y-3" onSubmit={handleSalvarTalhao}>
            <h3 className="font-medium text-ink">Talhão e responsável</h3>
            <p className="text-sm text-soil">
              Usado no PBZ e nos tratos. Fica só neste aparelho.
            </p>
            <Input
              label="Responsável"
              name="nomeResponsavel"
              value={talhao.nomeResponsavel}
              onChange={(event) => setTalhao({ ...talhao, nomeResponsavel: event.target.value })}
            />
            <Input
              label="Município"
              name="municipio"
              value={talhao.municipio}
              onChange={(event) => setTalhao({ ...talhao, municipio: event.target.value })}
            />
            <Input
              label="Talhões"
              name="talhoes"
              placeholder="Ex: Parcela 10"
              value={talhao.talhoes}
              onChange={(event) => setTalhao({ ...talhao, talhoes: event.target.value })}
            />
            <Input
              label="Área (ha)"
              name="areaHectares"
              inputMode="decimal"
              placeholder="2"
              value={talhao.areaHectares}
              onChange={(event) => setTalhao({ ...talhao, areaHectares: event.target.value })}
            />
            {salvoTalhao ? <Banner tone="ok">Talhão salvo neste aparelho.</Banner> : null}
            <Button type="submit" full variant="secondary">
              Salvar talhão
            </Button>
            <p className="text-sm text-soil">
              Safra, PBZ, calda e tratos também ficam aqui. Política: versão {POLITICA_VERSAO}.
            </p>
          </form>
        </Card>
      </div>

      <Card className="space-y-3">
        <Button
          full
          variant="ghost"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Sair
        </Button>
        <Button full variant="secondary" onClick={() => baixarDadosTitular()}>
          Exportar cópia (JSON)
        </Button>
        <Button full variant="outline" onClick={() => void compartilharDadosTitular()}>
          Compartilhar cópia
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
        {aviso ? <Banner tone="ok">{aviso}</Banner> : null}
        {pendente ? (
          <Button full onClick={confirmarRestaurar}>
            Confirmar restauração
          </Button>
        ) : null}
        {erro ? (
          <Banner tone="danger">{erro}</Banner>
        ) : (
          <p className="text-sm text-soil">
            Restaurar substitui o caderno deste aparelho pela cópia do arquivo.
          </p>
        )}
        <Button full variant="outline" onClick={handleApagar}>
          {confirmar ? 'Toque de novo para apagar tudo' : 'Apagar meus dados'}
        </Button>
        {confirmar ? (
          <Banner tone="danger">
            Isso apaga nome, telefone, caderno e o aceite neste aparelho. Não dá para desfazer.
          </Banner>
        ) : (
          <p className="text-sm text-soil">
            Sair só tira nome e telefone da sessão. Apagar remove o caderno também.
          </p>
        )}
      </Card>

      <Link to="/privacidade" className="block text-center text-sm text-field">
        Ler a Política de Privacidade
      </Link>
    </div>
  )
}
