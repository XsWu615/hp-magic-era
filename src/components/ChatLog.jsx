import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useGame } from '../store/gameStore.js'

export default function ChatLog() {
  const messages = useGame((s) => s.messages)
  const streaming = useGame((s) => s.streaming)
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages, streaming])

  return (
    <div className="chatlog" ref={ref}>
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
  )
}
