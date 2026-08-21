// DeepSeek API 调用层。前端请求 /api/...，由 Vite 代理转发到 api.deepseek.com 并注入密钥。

const ENDPOINT = '/api/chat/completions'
const MODEL = 'deepseek-v4-pro'

// 构建发给模型的消息序列
export function buildMessages(systemPrompt, history, userText) {
  const messages = [{ role: 'system', content: systemPrompt }]
  for (const m of history) {
    messages.push({ role: m.role, content: m.content })
  }
  messages.push({ role: 'user', content: userText })
  return messages
}

// 流式请求，逐段 yield 增量文本
export async function* streamChat(messages, { signal } = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.85,
      max_tokens: 2200,
      stream: true,
    }),
    signal,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek API 错误 ${res.status}: ${text}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const data = t.slice(5).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // 忽略无法解析的行
      }
    }
  }
}

// 从完整文本中提取状态更新 JSON 块（```json ... ```）
export function extractStatePatch(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/)
  if (!m) return null
  try {
    const obj = JSON.parse(m[1].trim())
    return obj && typeof obj === 'object' ? obj : null
  } catch {
    return null
  }
}

// 去掉正文中的状态 JSON 块，返回干净的剧情文本
export function stripStateBlock(text) {
  return text.replace(/```json\s*[\s\S]*?```/g, '').trim()
}
