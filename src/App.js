import { useEffect, useCallback, useState, useRef } from 'react'
import flvjs from 'pro-flv.js'
import './App.css'

function App() {
  const [player, setPlayer] = useState(null)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState(true)
  const [completed, setCompleted] = useState(0)
  const video = useRef(null)

  useEffect(() => {
    if (!flvjs.isSupported()) return

    const player = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      url: 'https://rtmp.leet.ar:8035/live/lukks.flv'
    })

    player.attachMediaElement(video.current)
    player.load()

    let loaded = 0
    player.on('statistics_info', onloaded)
    player.on('error', onerror)

    setPlayer(player)

    return () => {
      setCompleted(0)
      setPlayer(null)

      player.off('statistics_info', onloaded)
      player.off('error', onerror)

      player.detachMediaElement()
      player.destroy()
    }

    function onloaded () {
      if (++loaded === 2) {
        setCompleted(Date.now())
      }
    }

    function onerror () {
      console.log('player ERROR')
    }
  }, [])

  useEffect(() => {
    if (!player) return
    if (completed === 0) return

    player.pause()
    setReady(true)

    setCompleted(0)
  }, [completed, player])

  const onclick = useCallback(() => {
    if (!ready) return
    if (!player) return
    if (!player._mediaElement) return

    console.log({ status })

    setStatus(!status)

    // if (!player._transmuxer) player.load()

    if (status === true) {
      // Seek to last frame
      const idr = player._msectl.getNearestKeyframe(Infinity)
      if (idr != null) {
        player._requestSetTime = true
        player._mediaElement.currentTime = idr.dts / 1000
      }

      player.play()

      return
    }

    player.pause()
  }, [ready, status, player])

  if (!flvjs.isSupported()) {
    return (
      <div>FLV not supported.</div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <video ref={video} onClick={onclick} style={{ width: '100%', height: '100vh' }}></video>
      </header>
    </div>
  )
}

export default App
