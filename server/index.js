/**
 * API HexaVale: login do admin, vídeos de propaganda, histórico de login e healthcheck.
 * Do produtor recebe só telefone, propriedade e horário de cada login — nunca o caderno.
 * `npm start` (--app) entrega também a pasta dist (PWA + API no mesmo endereço).
 */
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, 'uploads', 'videos')
const distDir = path.join(__dirname, '..', 'dist')
fs.mkdirSync(uploadsDir, { recursive: true })

/** Um processo só: HTML do PWA + /api + /uploads. */
const serveApp = process.argv.includes('--app')
const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || (serveApp ? '0.0.0.0' : '127.0.0.1')
const TOKEN_HOURS = 12
const RETENCAO_LOGIN_MESES = 12

const JWT_EXEMPLO = new Set(['', 'hexa-manga-dev', 'troque-esta-chave-hexa-manga'])
const SENHA_EXEMPLO = new Set(['', 'HexaAdmin123'])

function jwtSecret() {
  return String(process.env.JWT_SECRET || '')
}

function senhaAdminEnv() {
  return String(process.env.ADMIN_PASSWORD || '')
}

function jwtFraco(secret) {
  return JWT_EXEMPLO.has(secret) || secret.length < 16
}

function senhaFraca(senha) {
  return SENHA_EXEMPLO.has(senha) || senha.length < 12
}

function recusarSegredosFracos() {
  if (jwtFraco(jwtSecret())) {
    console.error(
      'Defina JWT_SECRET no .env com pelo menos 16 caracteres. Não use o valor de exemplo.',
    )
    process.exit(1)
  }
  if (senhaFraca(senhaAdminEnv())) {
    console.error(
      'Defina ADMIN_PASSWORD no .env com pelo menos 12 caracteres. Não use a senha de exemplo.',
    )
    process.exit(1)
  }
}

if (serveApp) {
  recusarSegredosFracos()
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('Rode npm run build antes de npm start.')
    process.exit(1)
  }
} else if (jwtFraco(jwtSecret()) || senhaFraca(senhaAdminEnv())) {
  console.warn('JWT_SECRET ou ADMIN_PASSWORD ainda são de exemplo — use só em desenvolvimento.')
}

const JWT_SECRET = serveApp ? jwtSecret() : jwtSecret() || 'hexa-manga-dev'

const dbName = process.env.MYSQL_DATABASE || 'hexa_manga'
const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
}

const pool = mysql.createPool({
  ...dbConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
})

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const base = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 40)
      cb(null, `${Date.now()}-${base || 'video'}${ext}`)
    },
  }),
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mimeOk = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(
      file.mimetype,
    )
    const extOk = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext)
    const ok = mimeOk && extOk
    cb(ok ? null : new Error('Envie um vídeo MP4, WebM ou MOV.'), ok)
  },
})

function signAdmin(payload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: `${TOKEN_HOURS}h` })
}

function authAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'Faça login como administrador.' })
    return
  }
  try {
    req.admin = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    next()
  } catch {
    res.status(401).json({ error: 'Sessão expirada. Entre de novo.' })
  }
}

/** Cria o banco/tabelas e o primeiro admin se a tabela estiver vazia. */
async function ensureSchema() {
  const bootstrap = await mysql.createConnection(dbConfig)
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await bootstrap.end()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_admins_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ad_videos (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      titulo VARCHAR(180) NOT NULL,
      arquivo VARCHAR(255) NOT NULL,
      mime VARCHAR(80) NOT NULL,
      tamanho_bytes INT UNSIGNED NOT NULL,
      ativo TINYINT(1) NOT NULL DEFAULT 1,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_ad_videos_ativo (ativo, atualizado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_historico (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      telefone VARCHAR(11) NOT NULL,
      propriedade VARCHAR(120) NOT NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_login_historico_criado (criado_em),
      KEY idx_login_historico_telefone (telefone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  await pool.query(
    `DELETE FROM login_historico WHERE criado_em < NOW() - INTERVAL ${RETENCAO_LOGIN_MESES} MONTH`,
  )

  const nome = process.env.ADMIN_NOME || 'Administrador'
  const email = (process.env.ADMIN_EMAIL || 'admin@hexamanga.local').toLowerCase()
  const senha = senhaAdminEnv() || (serveApp ? '' : 'HexaAdmin123')

  if (serveApp && senhaFraca(senha)) {
    recusarSegredosFracos()
  }

  const [admins] = await pool.query('SELECT id, email, senha_hash FROM admins LIMIT 1')
  if (admins.length === 0) {
    const senha_hash = await bcrypt.hash(senha, 10)
    await pool.query(
      'INSERT INTO admins (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senha_hash],
    )
    console.log(`Administrador inicial: ${email}`)
  } else {
    const atual = admins[0]
    const mesmaSenha = await bcrypt.compare(senha, atual.senha_hash)
    const senhaAntigaExemplo = await bcrypt.compare('HexaAdmin123', atual.senha_hash)
    if (serveApp && (!mesmaSenha || atual.email !== email || senhaAntigaExemplo)) {
      const senha_hash = await bcrypt.hash(senha, 10)
      await pool.query('UPDATE admins SET senha_hash = ?, email = ?, nome = ? WHERE id = ?', [
        senha_hash,
        email,
        nome,
        atual.id,
      ])
      console.log('Administrador atualizado a partir do .env.')
    }
  }

  const amostra = 'hexavale-amostra.mp4'
  const amostraPath = path.join(uploadsDir, amostra)
  const [videos] = await pool.query('SELECT id FROM ad_videos LIMIT 1')
  if (videos.length === 0 && fs.existsSync(amostraPath)) {
    const tamanho = fs.statSync(amostraPath).size
    await pool.query(
      'INSERT INTO ad_videos (titulo, arquivo, mime, tamanho_bytes, ativo) VALUES (?, ?, ?, ?, 1)',
      ['Amostra Hexavale', amostra, 'video/mp4', tamanho],
    )
    console.log('Vídeo de amostra colocado no ar.')
  }

  const [noAr] = await pool.query('SELECT id FROM ad_videos WHERE ativo = 1 LIMIT 1')
  if (noAr.length === 0) {
    const [ultimo] = await pool.query('SELECT id FROM ad_videos ORDER BY atualizado_em DESC LIMIT 1')
    if (ultimo[0]) {
      await pool.query('UPDATE ad_videos SET ativo = 1 WHERE id = ?', [ultimo[0].id])
      console.log('Vídeo de anúncio recolocado no ar.')
    }
  }
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 'loopback')
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})
if (!serveApp) {
  const origem = process.env.CORS_ORIGIN
  app.use(cors({ origin: origem || true }))
}
app.use(express.json({ limit: '32kb' }))
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    fallthrough: false,
    index: false,
  }),
)

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: serveApp ? 'Banco indisponível.' : String(error.message || error),
    })
  }
})

const tentativasLogin = new Map()
const JANELA_LOGIN_MS = 15 * 60 * 1000
const MAX_FALHAS_LOGIN = 8

function falhasLogin(email) {
  const agora = Date.now()
  const lista = (tentativasLogin.get(email) || []).filter((t) => agora - t < JANELA_LOGIN_MS)
  tentativasLogin.set(email, lista)
  return lista
}

app.post('/api/admin/login', async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const senha = String(req.body?.senha || '')
  if (!email || !senha) {
    res.status(400).json({ error: 'Informe e-mail e senha.' })
    return
  }
  if (falhasLogin(email).length >= MAX_FALHAS_LOGIN) {
    res.status(429).json({ error: 'Muitas tentativas. Espere alguns minutos.' })
    return
  }

  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [
    email,
  ])
  const admin = rows[0]
  if (!admin || !(await bcrypt.compare(senha, admin.senha_hash))) {
    falhasLogin(email).push(Date.now())
    res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    return
  }
  tentativasLogin.delete(email)

  const token = signAdmin({ id: admin.id, email: admin.email, nome: admin.nome })
  res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } })
})

/** Vídeo do anúncio. Se ninguém estiver “no ar”, usa o último arquivo enviado. */
app.get('/api/ads/atual', async (_req, res) => {
  const [ativos] = await pool.query(
    'SELECT id, titulo, arquivo FROM ad_videos WHERE ativo = 1 ORDER BY atualizado_em DESC LIMIT 1',
  )
  let video = ativos[0]
  if (!video) {
    const [todos] = await pool.query(
      'SELECT id, titulo, arquivo FROM ad_videos ORDER BY atualizado_em DESC LIMIT 1',
    )
    video = todos[0]
  }
  if (!video || !fs.existsSync(path.join(uploadsDir, video.arquivo))) {
    res.status(404).json({ error: 'Nenhum vídeo ativo.' })
    return
  }
  res.set('Cache-Control', 'no-store')
  res.json({
    id: video.id,
    titulo: video.titulo,
    url: `/uploads/videos/${video.arquivo}`,
  })
})

const registrosLoginPorIp = new Map()
const JANELA_REGISTRO_MS = 60 * 1000
const MAX_REGISTROS_POR_IP = 10

function registrosRecentes(ip) {
  const agora = Date.now()
  const lista = (registrosLoginPorIp.get(ip) || []).filter((t) => agora - t < JANELA_REGISTRO_MS)
  registrosLoginPorIp.set(ip, lista)
  return lista
}

/** O app chama a cada login do produtor; sem aceite da política o login nem acontece. */
app.post('/api/login-historico', async (req, res) => {
  const ip = req.ip || 'desconhecido'
  if (registrosRecentes(ip).length >= MAX_REGISTROS_POR_IP) {
    res.status(429).json({ error: 'Muitos registros seguidos.' })
    return
  }
  const telefone = String(req.body?.telefone || '').replace(/\D/g, '')
  const propriedade = String(req.body?.propriedade || '').trim().slice(0, 120)
  if (telefone.length < 10 || telefone.length > 11 || propriedade.length < 2) {
    res.status(400).json({ error: 'Telefone ou propriedade inválidos.' })
    return
  }
  registrosRecentes(ip).push(Date.now())
  await pool.query('INSERT INTO login_historico (telefone, propriedade) VALUES (?, ?)', [
    telefone,
    propriedade,
  ])
  res.status(201).json({ ok: true })
})

app.get('/api/admin/logins', authAdmin, async (req, res) => {
  const busca = String(req.query.telefone || '').replace(/\D/g, '')
  const [rows] = busca
    ? await pool.query(
        'SELECT id, telefone, propriedade, criado_em FROM login_historico WHERE telefone LIKE ? ORDER BY criado_em DESC LIMIT 500',
        [`%${busca}%`],
      )
    : await pool.query(
        'SELECT id, telefone, propriedade, criado_em FROM login_historico ORDER BY criado_em DESC LIMIT 500',
      )
  res.set('Cache-Control', 'no-store')
  res.json(rows)
})

app.get('/api/admin/videos', authAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, titulo, arquivo, mime, tamanho_bytes, ativo, criado_em FROM ad_videos ORDER BY criado_em DESC',
  )
  res.json(
    rows.map((row) => ({
      ...row,
      ativo: Boolean(row.ativo),
      url: `/uploads/videos/${row.arquivo}`,
    })),
  )
})

app.post('/api/admin/videos', authAdmin, (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Falha no upload.' })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'Selecione um arquivo de vídeo.' })
      return
    }

    const titulo = String(req.body?.titulo || '').trim() || req.file.originalname
    const [result] = await pool.query(
      'INSERT INTO ad_videos (titulo, arquivo, mime, tamanho_bytes, ativo) VALUES (?, ?, ?, ?, 1)',
      [titulo, req.file.filename, req.file.mimetype, req.file.size],
    )

    res.status(201).json({
      id: result.insertId,
      titulo,
      arquivo: req.file.filename,
      url: `/uploads/videos/${req.file.filename}`,
      ativo: true,
    })
  })
})

app.patch('/api/admin/videos/:id', authAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const ativo = req.body?.ativo ? 1 : 0
  const [result] = await pool.query('UPDATE ad_videos SET ativo = ? WHERE id = ?', [
    ativo,
    id,
  ])
  if (!result.affectedRows) {
    res.status(404).json({ error: 'Vídeo não encontrado.' })
    return
  }
  res.json({ ok: true, ativo: Boolean(ativo) })
})

app.delete('/api/admin/videos/:id', authAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const [rows] = await pool.query('SELECT arquivo FROM ad_videos WHERE id = ?', [id])
  const video = rows[0]
  if (!video) {
    res.status(404).json({ error: 'Vídeo não encontrado.' })
    return
  }
  await pool.query('DELETE FROM ad_videos WHERE id = ?', [id])
  const nome = path.basename(String(video.arquivo || ''))
  const filePath = path.resolve(uploadsDir, nome)
  if (filePath.startsWith(path.resolve(uploadsDir) + path.sep)) {
    fs.unlink(filePath, () => {})
  }
  res.json({ ok: true })
})

if (serveApp) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next()
      return
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

ensureSchema()
  .then(() => {
    app.listen(PORT, HOST, () => {
      const local = `http://127.0.0.1:${PORT}`
      if (serveApp) {
        console.log(`Hexavale (app + API) em ${local}`)
      } else {
        console.log(`API Hexa Manga em ${local}`)
      }
    })
  })
  .catch((error) => {
    console.error('Não foi possível conectar no MySQL.')
    console.error(error.message)
    console.error('Suba o banco com: docker compose up -d')
    process.exit(1)
  })
