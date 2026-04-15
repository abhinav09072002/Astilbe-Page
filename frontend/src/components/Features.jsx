import React, { useState } from 'react'
import useReveal from './useReveal'

const CARDS = [
  { num: '01', title: 'Curated Intelligence', desc: 'Every story hand-selected by editors with domain expertise. No algorithm decides what you read.' },
  { num: '02', title: 'Weekly Deep Insights', desc: 'One substantial read each week. Long-form analysis that respects your intelligence and time.' },
  { num: '03', title: 'Zero Noise Policy', desc: 'No sponsored content. No clickbait. No engagement-baiting. Just clean signal, always.' },
  { num: '04', title: 'Exclusive Access', desc: 'Members-only archives, early access to special editions, and a community of sharp minds.' },
]

function Card({ card }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 'clamp(24px,4vw,36px) clamp(18px,3vw,26px) clamp(28px,4vw,40px)',
        background: hov ? 'rgba(255,255,255,.025)' : 'transparent',
        transition: 'background .35s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '0.5px solid rgba(255,255,255,.07)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: '16px solid rgba(255,255,255,.07)', borderLeft: '16px solid transparent' }} />
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.22em', color: 'rgba(255,255,255,.1)', marginBottom: 24 }}>{card.num}</p>
      <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(18px,2.5vw,21px)', fontWeight: 400, marginBottom: 12, lineHeight: 1.2, color: '#fff' }}>{card.title}</h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', fontWeight: 300, lineHeight: 1.85, letterSpacing: '.03em' }}>{card.desc}</p>
    </div>
  )
}

export default function Features() {
  const ref = useReveal()
  return (
    <>
      <style>{`
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 0.5px solid rgba(255,255,255,.07);
        }
        .features-grid > div { border-right: 0.5px solid rgba(255,255,255,.07); }
        .features-grid > div:last-child { border-right: none; }
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .features-grid > div { border-right: none; }
        }
      `}</style>
      <section style={{ background: '#000', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,48px)', borderTop: '0.5px solid rgba(255,255,255,.05)' }}>
        <div ref={ref} className="reveal">
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-block', width: 24, height: 0.5, background: 'rgba(255,255,255,.18)' }} />
            What We Offer
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(26px,4vw,46px)', fontWeight: 300, marginBottom: 44, color: '#fff' }}>
            Four pillars. <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.32)' }}>Zero compromise.</span>
          </h2>
          <div className="features-grid">
            {CARDS.map((c) => (
              <div key={c.num}>
                <Card card={c} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
