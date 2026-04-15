import React, { useState, useCallback } from 'react'
import APLogo from './APLogo'
import useReveal from './useReveal'

export default function Waitlist({ onSubmit, submitted }) {
  const [email, setEmail] = useState('')
  const ref = useReveal()

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    onSubmit(email)
  }, [email, onSubmit])

  return (
    <>
      <style>{`
        .waitlist-form {
          display: flex;
          border: 0.5px solid rgba(0,0,0,.18);
          max-width: 420px;
          margin: 0 auto 24px;
          flex-wrap: wrap;
        }
        .waitlist-input {
          flex: 1; min-width: 140px;
          background: transparent; border: none; outline: none;
          color: #000; font-family: 'DM Sans',sans-serif;
          font-size: 13px; letter-spacing: .05em;
          padding: 14px 20px;
        }
        .waitlist-btn {
          background: #000; color: #fff; border: none;
          font-family: 'DM Sans',sans-serif; font-size: 9px; font-weight: 500;
          letter-spacing: .22em; text-transform: uppercase;
          padding: 14px 24px; cursor: pointer; white-space: nowrap;
          min-height: 48px; touch-action: manipulation;
        }
      `}</style>
      <section
        id="waitlist"
        style={{ background: '#fff', color: '#000', padding: 'clamp(64px,10vw,108px) clamp(20px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: '72px solid rgba(0,0,0,.03)', borderRight: '72px solid transparent', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '72px solid rgba(0,0,0,.03)', borderLeft: '72px solid transparent', pointerEvents: 'none' }} />

        <div ref={ref} className="reveal">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <APLogo size={72} inverted={false} />
          </div>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,.26)', marginBottom: 18 }}>
            Limited Access
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(42px,7.5vw,92px)', fontWeight: 300, lineHeight: .96, color: '#000', marginBottom: 22 }}>
            Be First.<br /><span style={{ fontStyle: 'italic' }}>Stay Ahead.</span>
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,.36)', fontWeight: 300, letterSpacing: '.05em', lineHeight: 1.75, maxWidth: 360, margin: '0 auto 52px' }}>
            Join the waitlist for early access to AP — the newsletter that respects your intelligence.
          </p>

          {submitted ? (
            <div style={{ border: '0.5px solid rgba(0,0,0,.12)', padding: 'clamp(16px,3vw,20px) clamp(24px,5vw,40px)', maxWidth: 420, margin: '0 auto 24px', boxSizing: 'border-box', width: '100%' }}>
              <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', fontSize: 20, color: '#000', marginBottom: 4 }}>You're on the list.</p>
              <p style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,.28)' }}>We'll be in touch before launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="waitlist-form">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" className="waitlist-input" />
              <button type="submit" className="waitlist-btn">Subscribe</button>
            </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 10, flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {['A','B','C','D','E'].map((l, i) => (
                <div key={l} style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(255,255,255,.7)', fontWeight: 500, marginLeft: i === 0 ? 0 : -7 }}>
                  {l}
                </div>
              ))}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,.24)', marginLeft: 14 }}>
              🔥 2,000+ already waiting
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
