/** Upload e ativação dos vídeos que o app mostra no anúncio. */
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  adminRequest,
  clearAdminToken,
  getAdminToken,
  type AdVideo,
} from '@/lib/adminApi'

export function AdminVideosPage() {
  const navigate = useNavigate()
  const [videos, setVideos] = useState<AdVideo[]>([])
  const [titulo, setTitulo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadVideos() {
    const list = await adminRequest<AdVideo[]>('/api/admin/videos')
    setVideos(list)
  }

  useEffect(() => {
    loadVideos().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Falha ao carregar vídeos.')
    })
  }, [])

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError('Escolha o arquivo de vídeo.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const body = new FormData()
      body.append('video', file)
      body.append('titulo', titulo.trim() || file.name)
      const headers = new Headers()
      const token = getAdminToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      const response = await fetch('/api/admin/videos', { method: 'POST', headers, body })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Falha no envio.')
      setTitulo('')
      setFile(null)
      await loadVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no envio.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleAtivo(video: AdVideo) {
    await adminRequest(`/api/admin/videos/${video.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !video.ativo }),
    })
    await loadVideos()
  }

  async function removeVideo(video: AdVideo) {
    if (!window.confirm(`Apagar "${video.titulo}"?`)) return
    await adminRequest(`/api/admin/videos/${video.id}`, { method: 'DELETE' })
    await loadVideos()
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg bg-cream">
      <header className="mb-5 flex items-center gap-3 bg-field px-4 py-4 text-white">
        <Logo size={36} />
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Propagandas</h1>
          <p className="text-sm text-white/70">Vídeos do anúncio no app</p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-mango-light"
          onClick={() => {
            clearAdminToken()
            navigate('/admin/login', { replace: true })
          }}
        >
          Sair
        </button>
      </header>

      <div className="px-4 pb-8">

      <form className="space-y-4" onSubmit={handleUpload}>
        <Card className="space-y-4">
          <Input
            label="Título"
            name="titulo"
            placeholder="Ex: oferta da casa agrícola"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
          />
          <label className="block space-y-2">
            <span className="text-base font-bold text-soil">Arquivo (MP4 ou WebM)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="block w-full text-sm text-soil file:mr-3 file:rounded-leaf file:border-0 file:bg-field file:px-4 file:py-3 file:font-semibold file:text-cream"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {error ? <Banner tone="danger">{error}</Banner> : null}
          <Button type="submit" full disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar vídeo'}
          </Button>
        </Card>
      </form>

      <div className="mt-5 space-y-3">
        {videos.length === 0 ? (
          <p className="text-sm text-soil">Nenhum vídeo ainda. O app mostra a tela de espera até você enviar o primeiro.</p>
        ) : null}
        {videos.map((video) => (
          <Card key={video.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{video.titulo}</p>
                <p className="text-sm text-soil">{video.ativo ? 'No ar' : 'Pausado'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="min-h-11 px-3 text-sm" onClick={() => toggleAtivo(video)}>
                  {video.ativo ? 'Pausar' : 'Ativar'}
                </Button>
                <Button variant="ghost" className="min-h-11 px-3 text-sm" onClick={() => removeVideo(video)}>
                  Apagar
                </Button>
              </div>
            </div>
            <video src={video.url} className="w-full rounded-leaf bg-ink" controls playsInline />
          </Card>
        ))}
      </div>

      <Link
        to="/privacidade"
        className="mt-6 block pb-6 text-center text-sm text-field"
      >
        Privacidade
      </Link>
      </div>
    </div>
  )
}
