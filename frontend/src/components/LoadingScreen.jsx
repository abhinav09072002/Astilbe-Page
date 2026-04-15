import React, { useEffect, useState } from 'react'
import APLogo from './APLogo'

export default function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0)
  const [out, setOut] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setPct(p => {
        if (p >= 100) {
          clearInterval(t)
          setTimeout(() => { setOut(true); setTimeout(onDone, 600) }, 300)
          return 100
        }
        return p + 2
      })
    }, 28)
    return () => clearInterval(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity .7s', opacity: out ? 0 : 1, pointerEvents: out ? 'none' : 'all'
    }}>
      <div style={{ marginBottom: 48, animation: 'fadeIn .6s ease both' }}>
        {/* Logo inverted=true → white square on black loading screen */}
        <APLogo size={88} inverted={true} />
      </div>
      <div style={{ width: 160, height: 1, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#fff', width: `${pct}%`, transition: 'width .1s linear' }} />
      </div>
      <p style={{ marginTop: 20, fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)' }}>
        {pct < 100 ? 'Loading' : 'Ready'}
      </p>
    </div>
  )
}
