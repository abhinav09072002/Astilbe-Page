import React, { useEffect, useState, useCallback } from 'react'
import APLogo from './APLogo'

const PHRASES = ['Intelligence. Curated.', 'Signal Over Noise.', 'Think Ahead.']

export default function Hero({ onSubmit, submitted }) {
  const [email, setEmail] = useState('')
  const [typed, setTyped] = useState('')
  const [pi, setPi] = useState(0)
  const [ci, setCi] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[pi]
    let t
    if (!del && ci <= phrase.length) {
      t = setTimeout(() => setCi(c => c + 1), 58)
    } else if (!del) {
      t = setTimeout(() => setDel(true), 2400)
    } else if (del && ci > 0) {
      t = setTimeout(() => setCi(c => c - 1), 33)
    } else {
      setDel(false)
      setPi(p => (p + 1) % PHRASES.length)
    }
    setTyped(phrase.slice(0, ci))
    return () => clearTimeout(t)
  }, [ci, del, pi])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    onSubmit(email)
  }, [email, onSubmit])

  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh; background: #000;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: clamp(100px, 15vw, 120px) clamp(20px, 5vw, 32px) clamp(60px, 8vw, 80px);
          position: relative; overflow: hidden;
        }
        .hero-logo { margin-bottom: clamp(32px, 5vw, 52px); animation: fadeIn 1s ease both; }
        .hero-eyebrow { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: .32em; text-transform: uppercase; color: rgba(255,255,255,.22); margin-bottom: clamp(20px, 3vw, 32px); animation: fadeUp .8s ease both; animation-delay: .1s; }
        .hero-h1 { font-family: 'Cormorant Garamond',Georgia,serif; font-size: clamp(38px,9vw,100px); font-weight: 300; line-height: .95; letter-spacing: -.02em; margin-bottom: clamp(16px,2.5vw,28px); animation: fadeUp .8s ease both; animation-delay: .25s; }
        .hero-sub { font-size: clamp(13px,2vw,14px); color: rgba(255,255,255,.32); font-weight: 300; letter-spacing: .07em; max-width: 360px; line-height: 1.8; margin-bottom: clamp(36px,5vw,52px); animation: fadeUp .8s ease both; animation-delay: .4s; }
        .hero-form { display: flex; border: 0.5px solid rgba(255,255,255,.2); max-width: 420px; width: 100%; margin: 0 auto 18px; animation: fadeUp .8s ease both; animation-delay: .55s; flex-wrap: wrap; }
        .hero-input { flex: 1; min-width: 140px; background: transparent; border: none; outline: none; color: #fff; font-family: 'DM Sans',sans-serif; font-size: 13px; letter-spacing: .05em; padding: 14px 20px; }
        .hero-btn { background: #fff; color: #000; border: none; font-family: 'DM Sans',sans-serif; font-size: 9px; font-weight: 500; letter-spacing: .22em; text-transform: uppercase; padding: 14px 24px; cursor: pointer; white-space: nowrap; min-height: 48px; touch-action: manipulation; }
        .hero-proof { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.16); animation: fadeUp .8s ease both; animation-delay: .7s; }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes breathe{0%,100%{opacity:.7}50%{opacity:.2}}
      `}</style>
      <section className="hero-section">
        <div style={{ position: 'absolute', top: 0, left: '25%', width: .5, height: '100%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '75%', width: .5, height: '100%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: '64px solid rgba(255,255,255,.04)', borderLeft: '64px solid transparent', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderBottom: '64px solid rgba(255,255,255,.04)', borderRight: '64px solid transparent', pointerEvents: 'none' }} />

        <div className="hero-logo">
          <APLogo size={108} inverted={true} />
        </div>

        <p className="hero-eyebrow">A Premium Newsletter</p>
        <h1 className="hero-h1">
          {typed}<span className="cursor" />
        </h1>
        <p className="hero-sub">A premium newsletter for those who think ahead.</p>

        {submitted ? (
          <div style={{ border: '0.5px solid rgba(255,255,255,.12)', padding: 'clamp(16px,3vw,20px) clamp(24px,5vw,40px)', maxWidth: 420, margin: '0 auto 18px', animation: 'fadeIn .5s ease both', width: '100%', boxSizing: 'border-box' }}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', fontSize: 20, color: '#fff', marginBottom: 4 }}>You're on the list.</p>
            <p style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>We'll be in touch before launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="hero-form">
            <input className="hero-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" />
            <button type="submit" className="hero-btn">Join Waitlist</button>
          </form>
        )}

        <p className="hero-proof">🔥 &nbsp;2,000+ already waiting</p>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeIn 1.4s ease both', animationDelay: '1s' }}>
          <div style={{ width: .5, height: 36, background: 'rgba(255,255,255,.2)', animation: 'breathe 2.4s ease-in-out infinite' }} />
          <span style={{ fontSize: 8, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,.16)' }}>Scroll</span>
        </div>
      </section>
    </>
  )
}
