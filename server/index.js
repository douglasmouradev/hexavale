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
fs.mkdirSync(uploadsDir, { recursive: true })

const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET = process.env.JWT_SECRET || 'hexa-manga-dev'
const TOKEN_HOURS = 12

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
    const ok = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(
      file.mimetype,
    )
    cb(ok ? null : new Error('Envie um vídeo MP4, WebM ou MOV.'), ok)
  },
})

function signAdmin(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_HOURS}h` })
}

function authAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'Faça login como administrador.' })
    return
  }
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sessão expirada. Entre de novo.' })
  }
}

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

  const [admins] = await pool.query('SELECT id FROM admins LIMIT 1')
  if (admins.length === 0) {
    const nome = process.env.ADMIN_NOME || 'Administrador'
    const email = (process.env.ADMIN_EMAIL || 'admin@hexamanga.local').toLowerCase()
    const senha = process.env.ADMIN_PASSWORD || 'HexaAdmin123'
    const senha_hash = await bcrypt.hash(senha, 10)
    await pool.query(
      'INSERT INTO admins (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senha_hash],
    )
    console.log(`Administrador inicial: ${email}`)
  }
}

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) })
  }
})

app.post('/api/admin/login', async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const senha = String(req.body?.senha || '')
  if (!email || !senha) {
    res.status(400).json({ error: 'Informe e-mail e senha.' })
    return
  }

  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [
    email,
  ])
  const admin = rows[0]
  if (!admin || !(await bcrypt.compare(senha, admin.senha_hash))) {
    res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    return
  }

  const token = signAdmin({ id: admin.id, email: admin.email, nome: admin.nome })
  res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } })
})

app.get('/api/ads/atual', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, titulo, arquivo FROM ad_videos WHERE ativo = 1 ORDER BY atualizado_em DESC LIMIT 1',
  )
  const video = rows[0]
  if (!video) {
    res.status(404).json({ error: 'Nenhum vídeo ativo.' })
    return
  }
  res.json({
    id: video.id,
    titulo: video.titulo,
    url: `/uploads/videos/${video.arquivo}`,
  })
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
  const filePath = path.join(uploadsDir, video.arquivo)
  fs.unlink(filePath, () => {})
  res.json({ ok: true })
})

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API Hexa Manga em http://127.0.0.1:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Não foi possível conectar no MySQL.')
    console.error(error.message)
    console.error('Suba o banco com: docker compose up -d')
    process.exit(1)
  })
