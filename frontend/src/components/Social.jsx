import React from 'react'
import useReveal from './useReveal'

const STATS = [
  { value: '2,000+', label: 'On the waitlist' },
  { value: '100%', label: 'Editorially independent' },
  { value: '0', label: 'Ads. Ever.' },
]

export default function Social() {
  const ref = useReveal()
  return (
    <>
      <style>{`
        .social-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 0.5px solid rgba(255,255,255,.07);
        }
        .social-grid > div {
          border-right: 0.5px solid rgba(255,255,255,.07);
          padding: clamp(28px,5vw,48px) clamp(20px,3vw,32px);
          text-align: center;
        }
        .social-grid > div:last-child { border-right: none; }
        @media (max-width: 540px) {
          .social-grid { grid-template-columns: 1fr; }
          .social-grid > div { border-right: none; border-bottom: 0.5px solid rgba(255,255,255,.07); }
          .social-grid > div:last-child { border-bottom: none; }
        }
      `}</style>
      <section style={{ background: '#000', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,48px)', borderTop: '0.5px solid rgba(255,255,255,.05)' }}>
        <div ref={ref} className="reveal">
          <div className="social-grid">
            {STATS.map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(36px,5vw,54px)', fontWeight: 300, color: '#fff', marginBottom: 8, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
