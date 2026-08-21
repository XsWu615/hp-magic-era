import { useEffect } from 'react'
import { useGame, tryAutoResume } from './store/gameStore.js'
import StartupScreen from './components/StartupScreen.jsx'
import GameScreen from './components/GameScreen.jsx'

export default function App() {
  const phase = useGame((s) => s.phase)

  useEffect(() => {
    const data = tryAutoResume()
    if (data && useGame.getState().phase === 'startup') {
      useGame.getState().loadArchive(data)
    }
  }, [])

  return phase === 'playing' ? <GameScreen /> : <StartupScreen />
}
