import React from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, type = 'button', disabled = false,
  variant = 'primary', fullWidth = false, loading = false, style = {}
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 500,
    letterSpacing: '.22em', textTransform: 'uppercase',
    border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all .2s', whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : 'auto',
    padding: '13px 24px',
    ...style,
  }
  const variants = {
    primary: { background: disabled || loading ? 'rgba(255,255,255,.55)' : '#fff', color: '#000' },
    ghost:   { background: 'transparent', color: 'rgba(255,255,255,.5)', border: '0.5px solid rgba(255,255,255,.2)' },
    danger:  { background: 'transparent', color: 'rgba(255,80,80,.7)', border: '0.5px solid rgba(255,80,80,.2)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled && !loading) {
        if (variant === 'primary') e.currentTarget.style.background = 'rgba(255,255,255,.88)'
        if (variant === 'ghost')   { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,.4)' }
      }}}
      onMouseLeave={e => { if (!disabled && !loading) {
        if (variant === 'primary') e.currentTarget.style.background = '#fff'
        if (variant === 'ghost')   { e.currentTarget.style.color='rgba(255,255,255,.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,.2)' }
      }}}
    >
      {loading && <MiniSpinner color={variant === 'primary' ? '#000' : 'rgba(255,255,255,.6)'} />}
      {children}
    </button>
  )
}

// ─── MiniSpinner ──────────────────────────────────────────────────────────────
export function MiniSpinner({ color = '#000', size = 12 }) {
  return (
    <>
      <style>{`@keyframes uiSpin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `1.5px solid ${color}22`,
        borderTopColor: color,
        animation: 'uiSpin .65s linear infinite', flexShrink: 0,
      }} />
    </>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  type = 'text', name, value, onChange, placeholder, disabled,
  label, error, autoComplete, style = {},
  rightElement = null,
}) {
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={name} style={{
          display: 'block', fontSize: 9, letterSpacing: '.2em',
          textTransform: 'uppercase', color: focused ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.28)',
          marginBottom: 8, fontFamily: "'DM Sans',sans-serif", transition: 'color .2s',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={name} type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          disabled={disabled} autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: rightElement ? '12px 44px 12px 16px' : '12px 16px',
            background: focused ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
            border: error
              ? '0.5px solid rgba(255,80,80,.4)'
              : focused
                ? '0.5px solid rgba(255,255,255,.35)'
                : '0.5px solid rgba(255,255,255,.14)',
            color: '#fff', fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, letterSpacing: '.025em',
            transition: 'all .2s', opacity: disabled ? .55 : 1,
            outline: 'none', boxSizing: 'border-box',
            ...style,
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 10.5, color: 'rgba(255,100,100,.85)', marginTop: 5, letterSpacing: '.02em', fontFamily: "'DM Sans',sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = false }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        border: '0.5px solid rgba(255,255,255,.08)',
        background: hov ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.015)',
        transition: 'background .25s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── PageHero — reusable hero section for inner pages ────────────────────────
export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section style={{
      minHeight: '55vh', display: 'flex', alignItems: 'center',
      padding: 'clamp(100px,16vw,160px) clamp(24px,6vw,80px) clamp(60px,8vw,100px)',
      borderBottom: '0.5px solid rgba(255,255,255,.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Corner accents */}
      <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderTop:'80px solid rgba(255,255,255,.03)', borderLeft:'80px solid transparent', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, width:0, height:0, borderBottom:'80px solid rgba(255,255,255,.03)', borderRight:'80px solid transparent', pointerEvents:'none' }} />

      <div style={{ maxWidth: 800 }}>
        {eyebrow && (
          <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)', marginBottom: 20, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-block', width: 24, height: .5, background: 'rgba(255,255,255,.2)' }} />
            {eyebrow}
          </p>
        )}
        <h1 style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: 'clamp(40px,7vw,80px)', fontWeight: 300,
          letterSpacing: '-.02em', color: '#fff', lineHeight: .95, marginBottom: 24,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: 'rgba(255,255,255,.35)', letterSpacing: '.04em', lineHeight: 1.7, maxWidth: 560, fontFamily: "'DM Sans',sans-serif" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 24, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ display: 'inline-block', width: 20, height: .5, background: 'rgba(255,255,255,.2)' }} />
      {children}
    </p>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
      <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,.08)' }} />
      {label && <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>}
      <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,.08)' }} />
    </div>
  )
}
