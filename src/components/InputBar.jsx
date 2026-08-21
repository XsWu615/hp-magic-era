import { useState } from 'react'
import { useGame } from '../store/gameStore.js'

export default function InputBar() {
  const [text, setText] = useState('')
  const sendMessage = useGame((s) => s.sendMessage)
  const streaming = useGame((s) => s.streaming)

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() || streaming) return
    sendMessage(text)
    setText('')
  }

  return (
    <form className="inputbar" onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={streaming ? '世界正在运转……' : '说出你的行动、对话或选择……'}
        disabled={streaming}
      />
      <button type="submit" disabled={streaming || !text.trim()}>
        施法
      </button>
    </form>
  )
}
