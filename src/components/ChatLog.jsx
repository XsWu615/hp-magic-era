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

  const scrollTarget = useGame((s) => s.scrollTarget)

  useEffect(() => {
    if (!scrollTarget) return
    const el = ref.current
    if (!el) return
    const msgs = el.querySelectorAll('.msg')
    const target = msgs[scrollTarget.index]
    if (target) {
      stickToBottom.current = false
      setAtBottom(false)
      el.scrollTop = target.offsetTop - 12
    }
  }, [scrollTarget])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const userCount = messages.filter((m) => m.role === 'user').length
    const isNewSend = userCount > lastUserCount.current
    lastUserCount.current = userCount

    if (isNewSend) {
      // 发送后：把刚发的那句话滚到视口顶部，下方留白，之后保持不动
      stickToBottom.current = false
      setAtBottom(false)
      requestAnimationFrame(() => {
        const userEls = el.querySelectorAll('.msg-user')
        const userEl = userEls[userEls.length - 1]
        if (userEl) {
          el.scrollTop = userEl.offsetTop - 12
        }
      })
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
              m.content ? (
                <div className="markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-text">正在书写……</span>
                </div>
              )
            ) : (
              <div className="user-wrap">
                <div className="user-bubble">{m.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      {!atBottom && (
        <button className="scroll-bottom-btn" type="button" onClick={scrollToBottom}>
          ↓ 回到底部
        </button>
      )}
    </div>
  )
}
