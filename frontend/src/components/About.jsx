import React from 'react'
import useReveal from './useReveal'

export default function About() {
  const ref = useReveal()
  return (
    <>
      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px,6vw,72px);
          align-items: start;
          max-width: 980px;
        }
        @media (max-width: 640px) {
          .about-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
      <section style={{ background: '#000', padding: 'clamp(48px,8vw,88px) clamp(20px,5vw,48px)' }}>
        <div ref={ref} className="reveal">
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)', marginBottom: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-block', width: 24, height: 0.5, background: 'rgba(255,255,255,.18)' }} />
            About
          </p>
          <div className="about-grid">
            <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(28px,4.5vw,54px)', fontWeight: 300, lineHeight: 1.12, fontStyle: 'italic', color: '#fff' }}>
              Built for the<br />discerning mind.
            </h2>
            <div>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13.5, fontWeight: 300, lineHeight: 1.95, letterSpacing: '.04em', marginBottom: 18 }}>
                We are building a next-generation newsletter delivering sharp insights, curated knowledge, and signal over noise. Every edition is crafted with intention — no filler, no fluff.
              </p>
              <p style={{ color: 'rgba(255,255,255,.24)', fontSize: 13, fontWeight: 300, lineHeight: 1.95, letterSpacing: '.04em', marginBottom: 18 }}>
                In a world drowning in information, AP is your editorial compass. Premium analysis. Distilled perspectives. One email, every week.
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'rgba(255,255,255,.16)', fontSize: 13, paddingTop: 18, borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
                — Launching 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
