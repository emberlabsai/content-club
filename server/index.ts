import express from 'express'
import cors from 'cors'
import compression from 'compression'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { apiRouter } from './routes/api.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

const AUTH_SECRET = process.env.AUTH_PASSWORD || 'contentclub2026'

function createToken(username: string): string {
  return crypto.createHmac('sha256', AUTH_SECRET).update(username).digest('hex')
}

function verifyToken(token: string): boolean {
  const validUser = process.env.AUTH_USERNAME || 'tiffany'
  const expected = createToken(validUser)
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

app.use(cors())
app.use(compression())
app.use(express.json({ limit: '50mb' }))

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const validUser = process.env.AUTH_USERNAME || 'tiffany'
  const validPass = process.env.AUTH_PASSWORD || 'contentclub2026'

  if (username === validUser && password === validPass) {
    const token = createToken(username)
    res.json({ token })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token && verifyToken(token)) {
    res.json({ valid: true })
  } else {
    res.status(401).json({ valid: false })
  }
})

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.path.startsWith('/api/auth/')) return next()
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

app.use('/api', authMiddleware, apiRouter)

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[server] Tiffany's AI Content Club running on port ${PORT}`)
})
