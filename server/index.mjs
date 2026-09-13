import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { apiMiddleware } from './api.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT ? Number(process.env.PORT) : 4321
const OPEN_BROWSER = process.argv.includes('--open')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])

  if (url.startsWith('/api/')) {
    req.url = url.slice(4) // strip '/api'
    return apiMiddleware(req, res, () => {
      res.statusCode = 404
      res.end('not found')
    })
  }

  const candidate = path.join(DIST, url === '/' ? 'index.html' : url.slice(1))
  if (candidate.startsWith(DIST) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return serveFile(res, candidate)
  }
  // SPA fallback
  return serveFile(res, path.join(DIST, 'index.html'))
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[学习看板] 端口 ${PORT} 已有服务在运行，直接打开页面。`)
    if (OPEN_BROWSER) exec(`start "" "http://localhost:${PORT}"`)
    process.exit(0)
  }
  console.error(err)
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`[学习看板] 已启动: http://localhost:${PORT}`)
  console.log('[学习看板] 进度文件: data/progress.json （关闭本窗口即停止服务）')
  if (OPEN_BROWSER) exec(`start "" "http://localhost:${PORT}"`)
})
