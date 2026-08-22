import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useGame } from '../store/gameStore.js'

export default function ChatLog() {
  const messages = useGame((s) => s.messages)
  const streaming = useGame((s) => s.streaming)
  const ref = useRef(null)
  const stickToBottom = useRef(false)
  const lastUserCount = useRef(0)
  const [atBottom, setAtBottom] = useState(true)

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    stickToBottom.current = bottom
    setAtBottom(bottom)
  }

  const scrollToBottom = () => {
    const el = ref.current
    if (!el) return
    stickToBottom.current = true
    el.scrollTop = el.scrollHeight
    setAtBottom(true)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const userCount = messages.filter((m) => m.role === 'user').length
    const isNewSend = userCount > lastUserCount.current
    lastUserCount.current = userCount

    if (isNewSend) {
      // 发送后：把刚发的那句话滚到视口顶部，之后保持不动
      stickToBottom.current = false
      setAtBottom(false)
      const userEl = el.querySelector('.msg-user:last-of-type')
      if (userEl) {
        const cr = el.getBoundingClientRect()
        const ur = userEl.getBoundingClientRect()
        el.scrollTop += ur.top - cr.top - 12
      }
    } else if (stickToBottom.current) {
      // 用户滑到底部后，AI 流式输出才跟随
      el.scrollTop = el.scrollHeight
    }
  }, [messages, streaming])

  return (
    <div className="chatlog-wrap">
      <div className="chatlog" ref={ref} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="empty-hint">
            <p>世界已经运转了数百年，在你出生之前，在你死去之后。</p>
            <p>输入你的第一个行动，开启属于你自己的人生。</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'msg msg-' + m.role}>
            {m.role === 'assistant' ? (
              <div className="markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="user-wrap">
                <div className="user-bubble">{m.content}</div>
              </div>
            )}
          </div>
        ))}
        {streaming && <div className="typing">✦</div>}
      </div>
      {!atBottom && (
        <button className="scroll-bottom-btn" type="button" onClick={scrollToBottom}>
          ↓ 回到底部
        </button>
      )}
    </div>
  )
}
