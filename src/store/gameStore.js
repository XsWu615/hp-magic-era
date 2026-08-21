import { create } from 'zustand'
import { SYSTEM_PROMPT } from '../engine/systemPrompt.js'
import { buildMessages, streamChat, extractStatePatch } from '../engine/ai.js'
import { buildInitialState, buildMagicState } from '../config/gameConfig.js'
import { autoSave, autoLoad, clearSave, buildArchive } from '../engine/saveSystem.js'

function deepMerge(base, patch) {
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (
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

function buildSystemPrompt(character, state) {
  const card = `# 玩家角色卡
- 姓名：${character.name}
- 性别：${character.gender}
- 年龄：${character.age}
- 时代：${character.eraLabel || character.era}
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

# 当前游戏状态（JSON）
${JSON.stringify(state, null, 2)}

请根据以上角色卡与状态，模拟世界并继续推进。`
  return SYSTEM_PROMPT + '\n\n' + card
}

export const useGame = create((set, get) => ({
  phase: 'startup', // 'startup' | 'playing'
  character: null,
  state: null,
  messages: [], // [{role:'user'|'assistant', content}]
  streaming: false,
  error: null,

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

  async sendMessage(content) {
    content = (content || '').trim()
    if (!content || get().streaming) return
    const { character, state, messages } = get()
    const systemPrompt = buildSystemPrompt(character, state)
    const msgs = buildMessages(systemPrompt, messages, content)

    set((s) => ({
      messages: [...s.messages, { role: 'user', content }, { role: 'assistant', content: '' }],
      streaming: true,
      error: null,
    }))

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
      const patch = extractStatePatch(full)
      if (patch) get().updateState(patch)
      autoSave(buildArchive(get()))
    } catch (e) {
      const msg = e?.message || String(e)
      get().setError(msg)
      set((s) => ({ messages: s.messages.slice(0, -1) }))
    } finally {
      get().setStreaming(false)
    }
  },

  loadArchive(data) {
    set({
      phase: 'playing',
      character: data.character,
      state: data.state,
      messages: data.messages,
      error: null,
    })
    autoSave(buildArchive(get()))
  },

  resetGame() {
    clearSave()
    set({ phase: 'startup', character: null, state: null, messages: [], error: null, streaming: false })
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
