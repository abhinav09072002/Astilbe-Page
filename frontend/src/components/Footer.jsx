import React from 'react'
import APLogo from './APLogo'

export default function Footer() {
  return (
    <footer style={{
      background: '#000',
      borderTop: '0.5px solid rgba(255,255,255,.05)',
      padding: 'clamp(20px,3vw,28px) clamp(20px,5vw,48px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
    }}>
      <APLogo size={34} inverted={true} />

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.12)', textAlign: 'center', flex: '1 1 auto' }}>
        Launching Soon &copy; 2026 AP Newsletter
      </p>

      <div style={{ display: 'flex', gap: 28 }}>
        {['Privacy', 'Terms'].map(link => (
          <button
            key={link}
            style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.16)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .3s', padding: '4px 0', minHeight: 44 }}
            onMouseOver={e => e.target.style.color = 'rgba(255,255,255,.5)'}
            onMouseOut={e => e.target.style.color = 'rgba(255,255,255,.16)'}
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  )
}
