import { create } from 'zustand'
import { SYSTEM_PROMPT } from '../engine/systemPrompt.js'
import { buildMessages, streamChat, extractState, chatOnce } from '../engine/ai.js'
import { buildInitialState, buildMagicState } from '../config/gameConfig.js'
import { autoSave, autoLoad, clearSave, buildArchive } from '../engine/saveSystem.js'

// 保留最近 16 条消息原文，更早的压缩成摘要（UI 仍显示完整历史）
const RECENT_COUNT = 16

function deepMerge(base, patch) {
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'chapters' && Array.isArray(v)) {
      // 目录节点：追加并去重（按 title）
      const existing = new Set((base?.chapters || []).map((c) => c?.title))
      const fresh = v.filter((c) => c && c.title && !existing.has(c.title))
      out[k] = [...(base?.chapters || []), ...fresh]
    } else if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      base &&
      typeof base[k] === 'object' &&
      !Array.isArray(base[k])
    ) {
      out[k] = deepMerge(base[k], v)
    } else {
      out[k] = v
    }
  }
  return out
}

function buildSystemPrompt(character, state, summary) {
  const card = `# 玩家角色卡
- 姓名：${character.name}
- 性别：${character.gender}
- 年龄：${character.age}
- 时代：${character.eraLabel || character.era}（严格对照上面的"时代时间线锚点"，人物生死与事件必须符合该时代，不得出现已死人物或未发生事件）
- 血统：${character.bloodlineLabel || character.bloodline}
- 出身：${character.identityLabel || character.identity}
- 出生地/居住地：${character.location}
- 家庭状况：${character.family || '待定'}
- 魔法资质：${character.talentLabel || character.talent}
- 魔杖：${character.wand || '未获得'}
- 学院倾向：${character.houseLabel || character.house}
- 政治倾向：${character.politicsLabel || character.politics}
- 性格关键词：${character.traits || '无'}
- 人生目标：${character.goal || '尚未确定'}
- 模拟风格：${character.styleLabel || character.style}

${summary ? '# 早期剧情摘要（更早对话已压缩为下文，请据此保持剧情连贯）\n' + summary + '\n\n' : ''}# 当前游戏状态（JSON）
${JSON.stringify(state, null, 2)}

请根据以上角色卡、摘要与状态，模拟世界并继续推进。`
  return SYSTEM_PROMPT + '\n\n' + card
}

// 把对话压缩成摘要（增量：已有摘要 + 新对话），重点抓取影响后续剧情的要点
async function summarizeMessages(summary, messages) {
  const content = messages
    .map((m) => `${m.role === 'user' ? '玩家' : '剧情'}: ${m.content}`)
    .join('\n')
  const focus = `【摘要必须抓取的要点】
1. 关键事件：按时间顺序发生了什么
2. 人物：出现的人物、身份、与玩家的关系变化
3. 玩家选择与行动：做了什么决定、造成什么后果
4. 状态变化：位置、财富、技能、身份、学院、阵营等
5. 伏笔与未完成事项：线索、任务、承诺、悬而未决的事
6. 关键情报：会影响后续剧情的对话内容或信息`
  const prompt = summary
    ? `你是剧情摘要助手。请把新对话并入已有摘要，输出更新后的完整摘要。

【已有摘要】
${summary}

【新对话】
${content}

${focus}

【要求】
- 第三人称，信息密度高，只写要点不写废话
- 合并后 300-600 字，宁详勿略
- 任何可能影响后续剧情的细节都不能丢`
    : `你是剧情摘要助手。请把下面的对话压缩成剧情摘要。

【对话】
${content}

${focus}

【要求】
- 第三人称，信息密度高，只写要点不写废话
- 300-600 字，宁详勿略
- 任何可能影响后续剧情的细节都不能丢`
  return await chatOnce([{ role: 'user', content: prompt }], { maxTokens: 900, temperature: 0.3 })
}

export const useGame = create((set, get) => ({
  phase: 'startup', // 'startup' | 'playing'
  character: null,
  state: null,
  messages: [], // 完整对话（UI 显示），[{role:'user'|'assistant', content}]
  streaming: false,
  error: null,
  scrollTarget: null, // 目录跳转目标 { index, ts }
  exporting: false,
  novelProgress: 0, // 小说导出已生成字数

  startGame(character) {
    const state = { ...buildInitialState(character), ...buildMagicState(character) }
    set({ phase: 'playing', character, state, messages: [], error: null })
    autoSave(buildArchive({ character, state, messages: [] }))
  },

  updateState(patch) {
    if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) return
    set((s) => ({ state: deepMerge(s.state, patch) }))
  },

  setStreaming(v) {
    set({ streaming: v })
  },

  setError(e) {
    set({ error: e })
  },

  scrollToMessage(index) {
    set({ scrollTarget: { index, ts: Date.now() } })
  },

  async sendMessage(content) {
    content = (content || '').trim()
    if (!content || get().streaming) return
    const { character, state, messages } = get()

    // 立即显示用户消息 + 空回答占位（不等摘要/请求）
    set((s) => ({
      messages: [...s.messages, { role: 'user', content }, { role: 'assistant', content: '' }],
      streaming: true,
      error: null,
    }))

    // 上下文压缩：把超出的旧消息压成摘要（UI 不变，仅影响发给 DeepSeek 的内容）
    let summary = state.summary || ''
    let summarizedCount = state.summarizedCount || 0
    const allMessages = [...messages, { role: 'user', content }]
    if (allMessages.length > RECENT_COUNT) {
      const overflow = allMessages.length - RECENT_COUNT
      if (overflow > summarizedCount) {
        try {
          const toSummarize = allMessages.slice(summarizedCount, overflow)
          summary = await summarizeMessages(summary, toSummarize)
          summarizedCount = overflow
          set((s) => ({ state: { ...s.state, summary, summarizedCount } }))
        } catch {
          // 摘要失败则沿用旧摘要，不阻断主流程
        }
      }
    }

    const recentHistory = allMessages.slice(-(RECENT_COUNT - 1))
    const systemPrompt = buildSystemPrompt(character, state, summary)
    const msgs = buildMessages(systemPrompt, recentHistory, content)

    let full = ''
    try {
      for await (const delta of streamChat(msgs)) {
        full += delta
        set((s) => {
          const msgs2 = [...s.messages]
          const last = msgs2[msgs2.length - 1]
          msgs2[msgs2.length - 1] = { ...last, content: last.content + delta }
          return { messages: msgs2 }
        })
      }
      const { patch, cleaned } = extractState(full)
      if (patch) {
        if (Array.isArray(patch.chapters)) {
          patch.chapters = patch.chapters.map((c, i) => ({ ...c, msgIndex: messages.length + i }))
        }
        get().updateState(patch)
      }
      set((s) => {
        const msgs2 = [...s.messages]
        const last = msgs2[msgs2.length - 1]
        msgs2[msgs2.length - 1] = { ...last, content: cleaned }
        return { messages: msgs2 }
      })
      autoSave(buildArchive(get()))
    } catch (e) {
      const msg = e?.message || String(e)
      get().setError(msg)
      set((s) => ({ messages: s.messages.slice(0, -1) }))
    } finally {
      get().setStreaming(false)
    }
  },

  // 失败后重发最后一条用户消息
  retry() {
    const { messages, streaming } = get()
    if (streaming) return
    let idx = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        idx = i
        break
      }
    }
    if (idx === -1) return
    const content = messages[idx].content
    set((s) => ({ messages: s.messages.slice(0, idx), error: null }))
    get().sendMessage(content)
  },

  // 导出小说文本（去对话化，流式 + 进度）
  async exportNovel() {
    const { messages, character, exporting } = get()
    if (exporting || messages.length === 0) return null
    set({ exporting: true, novelProgress: 0 })
    try {
      const text = messages
        .map((m) => `${m.role === 'user' ? '玩家' : '剧情'}: ${m.content}`)
        .join('\n\n')
      const prompt = `你是一名出版级小说作者。请把下面的对话记录改写成一部优秀的第三人称小说（以"${character?.name || '主角'}"为主角，用"他/她"指代，不用"你"）。要求：
1. 去掉对话模式（"玩家说""剧情说"这类标签），改为流畅的小说叙事
2. 保留所有关键情节、人物、选择、细节；人物原话可保留为引语
3. 分段落，按剧情节点加小标题分章
4. 不改变任何事实，不添加原文没有的内容

【文学性要求】向优秀出版小说看齐，切忌流水账：
- 环境描写有画面感，善用五感营造氛围
- 人物立体：神态、动作、心理、语气，对话贴合性格
- 节奏有起伏，关键情节详写、过渡略写
- 语言精炼有文采，善用修辞但不堆砌
- 章节开头有钩子，结尾留余味

书名：《哈利·波特·魔法纪元》
主角：${character?.name || '玩家'}

对话记录：
${text}`

      let novel = ''
      for await (const delta of streamChat([{ role: 'user', content: prompt }], { maxTokens: 8000 })) {
        novel += delta
        set({ novelProgress: novel.length })
      }
      const blob = new Blob([novel], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${character?.name || '主角'}-魔法纪元小说.txt`
      a.click()
      URL.revokeObjectURL(url)
      return novel
    } catch (e) {
      get().setError('导出失败：' + (e?.message || e))
      return null
    } finally {
      set({ exporting: false, novelProgress: 0 })
    }
  },

  loadArchive(data) {
    set({
      phase: 'playing',
      character: data.character,
      state: data.state,
      messages: data.messages,
      error: null,
      streaming: false,
    })
    autoSave(buildArchive(get()))
  },

  resetGame() {
    clearSave()
    set({
      phase: 'startup',
      character: null,
      state: null,
      messages: [],
      error: null,
      streaming: false,
      exporting: false,
    })
  },
}))

// 尝试从 localStorage 恢复上次会话
export function tryAutoResume() {
  const data = autoLoad()
  if (data && data.character && data.state && Array.isArray(data.messages)) {
    return data
  }
  return null
}
