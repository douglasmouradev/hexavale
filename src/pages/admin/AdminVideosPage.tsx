/** Upload e ativação dos vídeos que o app mostra no anúncio. */
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { adminRequest, getAdminToken, type AdVideo } from '@/lib/adminApi'

export function AdminVideosPage() {
  const [videos, setVideos] = useState<AdVideo[]>([])
  const [titulo, setTitulo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadVideos() {
    const list = await adminRequest<AdVideo[]>('/api/admin/videos')
    setVideos(Array.isArray(list) ? list : [])
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
    <div className="min-h-svh bg-cream">
      <AdminHeader subtitulo="Vídeos do anúncio no app" />

      <div className="mx-auto max-w-lg px-4 py-5 pb-8 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-8 lg:px-8">

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

      <div className="mt-5 space-y-3 lg:mt-0">
        {videos.length === 0 ? (
          <Card className="space-y-2">
            <p className="font-medium text-ink">Nenhum vídeo no ar</p>
            <p className="text-sm text-soil">
              Envie um MP4 acima. Sem vídeo ativo, o produtor entra no app sem anúncio após o login.
            </p>
          </Card>
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
        className="mt-6 block pb-6 text-center text-sm text-field lg:col-span-2"
      >
        Privacidade
      </Link>
      </div>
    </div>
  )
}
