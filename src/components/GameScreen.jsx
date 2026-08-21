import { useState, useEffect } from 'react'
import ChatLog from './ChatLog.jsx'
import InputBar from './InputBar.jsx'
import StatusPanel from './StatusPanel.jsx'
import SavePanel from './SavePanel.jsx'
import LiquidGlass from './LiquidGlass.jsx'
import { useGame } from '../store/gameStore.js'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 820)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function GameScreen() {
  const error = useGame((s) => s.error)
  const character = useGame((s) => s.character)
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  if (isMobile) {
    return (
      <div className="gamescreen mobile">
        <header className="game-header">
          <div className="brand">魔法纪元</div>
          <div className="char-name">{character?.name}</div>
          <button className={'tool-btn' + (panelOpen ? ' tool-btn-active' : '')} onClick={() => setPanelOpen((v) => !v)}>
            状态
          </button>
          <SavePanel />
        </header>
        {error && <div className="error-bar">⚠ {error}</div>}
        <div className="mobile-main">
          <div className="mobile-chat">
            <ChatLog />
          </div>
          <InputBar />
        </div>
        {panelOpen && <div className="mobile-panel-mask" onClick={() => setPanelOpen(false)} />}
        <div className={'mobile-panel' + (panelOpen ? ' mobile-panel-open' : '')}>
          <StatusPanel />
        </div>
      </div>
    )
  }

  return (
    <div className="gamescreen">
      <header className="game-header">
        <div className="brand">哈利·波特 · 魔法纪元</div>
        <div className="char-name">{character?.name}</div>
        <SavePanel />
      </header>
      {error && <div className="error-bar">⚠ {error}</div>}
      <div className="game-main">
        <div className="story-col">
          <ChatLog />
        </div>
        <LiquidGlass
          cornerRadius={24}
          padding="0"
          style={{ position: 'absolute', top: '50%', left: 'calc(100% - 200px)' }}
        >
          <StatusPanel />
        </LiquidGlass>
        <LiquidGlass
          cornerRadius={999}
          padding="4px"
          style={{ position: 'absolute', top: 'calc(100% - 64px)', left: '50%' }}
        >
          <InputBar />
        </LiquidGlass>
      </div>
    </div>
  )
}
