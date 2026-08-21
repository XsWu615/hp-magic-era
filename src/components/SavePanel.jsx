import { useState } from 'react'
import { useGame } from '../store/gameStore.js'
import { exportArchive, parseArchive } from '../engine/saveSystem.js'

export default function SavePanel() {
  const game = useGame()
  const [open, setOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [msg, setMsg] = useState('')

  const doExport = () => {
    exportArchive(game)
    setMsg('存档已导出为 JSON 文件。')
  }

  const doImport = () => {
    const data = parseArchive(importText)
    if (!data) {
      setMsg('存档格式无效，请粘贴完整的存档 JSON。')
      return
    }
    useGame.getState().loadArchive(data)
    setMsg('存档已恢复。')
    setOpen(false)
  }

  const doReset = () => {
    if (window.confirm('确定要重新开始吗？当前进度将丢失（已导出的存档不受影响）。')) {
      useGame.getState().resetGame()
    }
  }

  return (
    <div className="savepanel">
      <button className="tool-btn" onClick={() => setOpen((o) => !o)}>
        存档
      </button>
      {open && (
        <div className="save-drop">
          <button onClick={doExport}>导出完整存档（JSON）</button>
          <div className="save-import">
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴存档 JSON 以恢复……"
            />
            <button onClick={doImport}>恢复存档</button>
          </div>
          <button className="danger" onClick={doReset}>
            重新开始
          </button>
          {msg && <div className="save-msg">{msg}</div>}
        </div>
      )}
    </div>
  )
}
