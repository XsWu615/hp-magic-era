// 生产服务器：托管 dist 静态文件 + 代理 /api 到 DeepSeek（密钥不暴露给浏览器）
// 运行：node server.mjs   （端口由环境变量 PORT 控制，默认 8787）
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT) || 8787

// 从 .env 读取密钥（不覆盖已存在的环境变量）
function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx > 0) {
        const k = t.slice(0, idx).trim()
        const v = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
        if (!process.env[k]) process.env[k] = v
      }
    }
  } catch {
    // .env 不存在时忽略
  }
}
loadEnv()
const KEY = process.env.DEEPSEEK_API_KEY || ''

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
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(DIST, safe === '/' ? 'index.html' : safe)
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    res.end()
    return
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      filePath = path.join(DIST, 'index.html') // SPA 回退
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
  })
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function proxyDeepseek(req, res) {
  if (!KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: '服务器未配置 DEEPSEEK_API_KEY' }))
    return
  }
  const upstreamPath = req.url.replace(/^\/api/, '')
  const upstreamUrl = 'https://api.deepseek.com' + upstreamPath
  try {
    const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : undefined
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'] || 'application/json',
        authorization: `Bearer ${KEY}`,
      },
      body,
    })
    const headers = {}
    for (const [k, v] of upstream.headers) {
      const lk = k.toLowerCase()
      if (['content-type', 'content-length', 'transfer-encoding', 'cache-control'].includes(lk)) {
        headers[k] = v
      }
    }
    res.writeHead(upstream.status, headers)
    if (upstream.body) {
      await pipeline(Readable.fromWeb(upstream.body), res)
    } else {
      res.end()
    }
  } catch (e) {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ error: '代理请求失败: ' + e.message }))
    } else {
      res.end()
    }
  }
}

const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/')) {
    proxyDeepseek(req, res)
  } else {
    serveStatic(req, res)
  }
})

server.listen(PORT, () => {
  console.log(`哈利·波特·魔法纪元 运行于 http://localhost:${PORT}`)
})
