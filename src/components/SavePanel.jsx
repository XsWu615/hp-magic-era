import { useState } from 'react'
import { useGame } from '../store/gameStore.js'
import { exportArchive, parseArchive, saveToSlot, loadFromSlot, listSlots } from '../engine/saveSystem.js'

export default function SavePanel() {
  const game = useGame()
  const exporting = useGame((s) => s.exporting)
  const [open, setOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [msg, setMsg] = useState('')
  const [slots, setSlots] = useState(listSlots)

  const refreshSlots = () => setSlots(listSlots())

  const doExport = () => {
    exportArchive(game)
    setMsg('存档已导出为 JSON 文件。')
  }

  const doExportNovel = async () => {
    setMsg('正在生成小说文本，请稍候……')
    const novel = await useGame.getState().exportNovel()
    if (novel) setMsg('小说已导出为 txt 文件。')
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

  const doSaveSlot = (slot) => {
    if (saveToSlot(slot, game)) {
      setMsg(`已保存到槽位 ${slot + 1}`)
      refreshSlots()
    }
  }

  const doLoadSlot = (slot) => {
    const data = loadFromSlot(slot)
    if (!data) {
      setMsg(`槽位 ${slot + 1} 为空`)
      return
    }
    if (!window.confirm(`确定加载槽位 ${slot + 1} 的存档吗？当前进度将被覆盖。`)) return
    useGame.getState().loadArchive(data)
    setMsg(`已加载槽位 ${slot + 1}`)
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
          <button className="novel-btn" onClick={doExportNovel} disabled={exporting}>
            {exporting ? '生成中……' : '📖 导出小说文本'}
          </button>
          <button onClick={doExport}>导出存档（JSON）</button>

          <div className="save-slots">
            <div className="save-slots-title">存档槽位</div>
            {[0, 1, 2].map((slot) => {
              const s = slots.find((x) => x.slot === slot)
              return (
                <div key={slot} className="save-slot-row">
                  <span className="save-slot-name">
                    槽位{slot + 1}：{s ? s.name : '空'}
                  </span>
                  <button onClick={() => doSaveSlot(slot)}>存</button>
                  <button onClick={() => doLoadSlot(slot)} disabled={!s}>
                    读
                  </button>
                </div>
              )
            })}
          </div>

          <div className="save-import">
            <textarea
              rows={3}
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
