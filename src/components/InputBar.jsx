import { useState, useRef, useEffect } from 'react'
import { useGame } from '../store/gameStore.js'

export default function InputBar() {
  const [text, setText] = useState('')
  const sendMessage = useGame((s) => s.sendMessage)
  const streaming = useGame((s) => s.streaming)
  const ref = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 820

  useEffect(() => {
    const ta = ref.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }
  }, [text])

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() || streaming) return
    sendMessage(text)
    setText('')
  }

  return (
    <form className="inputbar" onSubmit={submit}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit(e)
          }
        }}
        placeholder={streaming ? '世界正在运转……' : isMobile ? '说出你的行动、对话或选择……' : '说出你的行动、对话或选择……（Enter 发送，Shift+Enter 换行）'}
        disabled={streaming}
        rows={1}
      />
      <button type="submit" disabled={streaming || !text.trim()}>
        施法
      </button>
    </form>
  )
}
