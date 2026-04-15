import React from 'react'
import useReveal from './useReveal'

function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Results({ subscribers }) {
  const ref = useReveal()

  return (
    <section style={{ background: '#000', padding: 'clamp(48px,8vw,72px) clamp(20px,5vw,48px)', borderTop: '0.5px solid rgba(255,255,255,.05)' }}>
      <div ref={ref} className="reveal">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'inline-block', width: 24, height: 0.5, background: 'rgba(255,255,255,.18)' }} />
          Live Waitlist
        </p>

        {subscribers.length === 0 ? (
          <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'rgba(255,255,255,.16)', fontSize: 16, padding: '48px 0' }}>
            No subscribers yet — be the first to join above.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 80, fontWeight: 300, lineHeight: 1, color: '#fff' }}>
                {subscribers.length.toLocaleString()}
              </span>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.26)', marginBottom: 40 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#4ade80', marginRight: 8, animation: 'breathe 2s infinite', verticalAlign: 'middle' }} />
              Waitlist subscriber{subscribers.length !== 1 ? 's' : ''}
            </p>

            <div style={{ border: '0.5px solid rgba(255,255,255,.07)', maxWidth: 580 }}>
              {[...subscribers].reverse().map((s, i) => (
                <div
                  key={s.email + s.ts}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', flexWrap: 'wrap', gap: '4px',
                    borderBottom: i === subscribers.length - 1 ? 'none' : '0.5px solid rgba(255,255,255,.05)',
                    fontSize: 12.5, letterSpacing: '.03em', color: 'rgba(255,255,255,.55)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,.18)', minWidth: 24 }}>
                      {subscribers.length - i}
                    </span>
                    <span>{s.email}</span>
                  </span>
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.18)', letterSpacing: '.08em' }}>
                    {fmt(s.ts)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes breathe{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </section>
  )
}
