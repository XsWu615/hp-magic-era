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

const STATE_KEYS = [
  'time',
  'age',
  'name',
  'gender',
  'bloodline',
  'identity',
  'location',
  'profession',
  'wealth',
  'family',
  'socialStatus',
  'magicAbility',
  'combatAbility',
  'potionHealing',
  'skills',
  'reputation',
  'relations',
  'faction',
  'goal',
  'worldEvents',
  'rumors',
  'wand',
  'magicCapacity',
  'control',
  'affinity',
  'mainSubjects',
  'spells',
  'potionLevel',
  'occlumency',
  'apparition',
  'patronus',
]

function looksLikeState(obj) {
  return STATE_KEYS.some((k) => k in obj)
}

// 从文本末尾找最后一个 {...} 块（支持嵌套），用于识别 AI 输出的裸 JSON
function findLastJsonObject(text) {
  const lastBrace = text.lastIndexOf('}')
  if (lastBrace === -1) return null
  let depth = 0
  for (let i = lastBrace; i >= 0; i--) {
    const c = text[i]
    if (c === '}') depth++
    else if (c === '{') {
      depth--
      if (depth === 0) {
        const raw = text.slice(i, lastBrace + 1)
        try {
          const obj = JSON.parse(raw)
          return obj && typeof obj === 'object' ? { raw, obj } : null
        } catch {
          return null
        }
      }
    }
  }
  return null
}

// 从完整回复中提取状态补丁 + 干净的剧情文本。
// 支持 ```json 代码块 和 裸 JSON（AI 有时不遵守格式）。
export function extractState(text) {
  const codeBlock = text.match(/```json\s*([\s\S]*?)```/)
  if (codeBlock) {
    const cleaned = text.replace(codeBlock[0], '').trim()
    try {
      const obj = JSON.parse(codeBlock[1].trim())
      return obj && typeof obj === 'object' ? { patch: obj, cleaned } : { patch: null, cleaned }
    } catch {
      return { patch: null, cleaned }
    }
  }
  const bare = findLastJsonObject(text)
  if (bare && looksLikeState(bare.obj)) {
    const cleaned = text.replace(bare.raw, '').trim()
    return { patch: bare.obj, cleaned }
  }
  return { patch: null, cleaned: text }
}
