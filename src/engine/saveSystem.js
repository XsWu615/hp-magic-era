// 存档系统：localStorage 自动存档 + 手动导出/导入完整存档

const STORAGE_KEY = 'hp-magic-era-save'

export function autoSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function autoLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function buildArchive(game) {
  return {
    app: '哈利·波特·魔法纪元·完整人生存档',
    version: 1,
    savedAt: new Date().toISOString(),
    character: game.character,
    state: game.state,
    messages: game.messages,
  }
}

export function exportArchive(game) {
  const archive = buildArchive(game)
  const json = JSON.stringify(archive, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const name = (game.character?.name || '玩家') + '-魔法纪元存档-' + Date.now() + '.json'
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function parseArchive(text) {
  try {
    const data = JSON.parse(text)
    if (data && data.character && data.state && Array.isArray(data.messages)) {
      return data
    }
    return null
  } catch {
    return null
  }
}
