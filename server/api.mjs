import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'progress.json')

function readProgress() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeProgress(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

function json(res, code, body) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export function apiMiddleware(req, res, next) {
  const url = (req.url || '').split('?')[0]

  if (url === '/progress' && req.method === 'GET') {
    const state = readProgress()
    if (!state) return json(res, 404, { error: 'no progress file yet' })
    return json(res, 200, state)
  }

  if (url === '/progress' && req.method === 'PUT') {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
        if (!body || typeof body !== 'object' || !body.phases) {
          return json(res, 400, { error: 'invalid progress payload' })
        }
        writeProgress(body)
        return json(res, 200, { ok: true, savedAt: new Date().toISOString() })
      } catch (e) {
        return json(res, 400, { error: 'bad json: ' + e.message })
      }
    })
    return
  }

  next()
}
