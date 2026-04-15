import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import APLogo from './APLogo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_LINKS = [
  { label: 'Platform',     path: '/platform' },
  { label: 'Solutions',    path: '/solutions' },
  { label: 'Resources',    path: '/resources' },
  { label: 'Enterprises',  path: '/enterprises' },
  { label: 'Ad Networking',path: '/ad-networking' },
  { label: 'Pricing',      path: '/pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logoutUser } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 900) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  function handleLogout() { logoutUser(); navigate('/') }
  function handleWaitlist() { setMenuOpen(false); document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' }) }

  const ghostLink = {
    fontFamily: "'DM Sans',sans-serif", fontSize: 9.5, letterSpacing: '.16em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,.38)',
    textDecoration: 'none', cursor: 'pointer', transition: 'color .25s',
    padding: '4px 0', whiteSpace: 'nowrap',
    borderBottom: '0.5px solid transparent',
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        .apnav-links { display: flex; align-items: center; gap: 0; }
        .apnav-item {
          font-family: 'DM Sans',sans-serif; font-size: 9.5px; letter-spacing: .14em;
          text-transform: uppercase; color: rgba(255,255,255,.38);
          text-decoration: none; cursor: pointer; background: none; border: none;
          padding: 8px 13px; transition: color .22s; white-space: nowrap;
          border-bottom: 1px solid transparent; display: inline-block;
        }
        .apnav-item:hover { color: #fff; }
        .apnav-item.active { color: rgba(255,255,255,.75); border-bottom-color: rgba(255,255,255,.25); }
        .apnav-burger { display: none; }
        .apnav-mobile { display: none; }

        @media (max-width: 899px) {
          .apnav-links { display: none !important; }
          .apnav-burger {
            display: flex; flex-direction: column; justify-content: center; gap: 5px;
            background: none; border: none; cursor: pointer; padding: 8px; z-index: 200;
          }
          .apnav-burger span { display: block; width: 22px; height: 0.5px; background: rgba(255,255,255,.6); transition: all .3s; }
          .apnav-burger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
          .apnav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
          .apnav-burger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
          .apnav-mobile {
            display: flex; flex-direction: column;
            position: fixed; inset: 0; z-index: 150;
            background: rgba(0,0,0,.97); backdrop-filter: blur(20px);
            padding: clamp(80px,16vw,110px) clamp(24px,6vw,48px) 48px;
            transform: translateX(100%);
            transition: transform .35s cubic-bezier(.16,1,.3,1);
            overflow-y: auto;
          }
          .apnav-mobile.open { transform: translateX(0); }
          .apnav-mobile-section { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: .28em; text-transform: uppercase; color: rgba(255,255,255,.18); margin: 24px 0 10px; padding: 0; }
          .apnav-mobile-item {
            padding: 16px 0; border-bottom: 0.5px solid rgba(255,255,255,.07);
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: clamp(26px,5vw,32px); font-weight: 300;
            color: rgba(255,255,255,.65); text-decoration: none;
            background: none; border-left: none; border-right: none; border-top: none;
            cursor: pointer; text-align: left; letter-spacing: -.01em;
            transition: color .2s; width: 100%; display: block;
          }
          .apnav-mobile-item:first-of-type { border-top: 0.5px solid rgba(255,255,255,.07); }
          .apnav-mobile-item:hover { color: #fff; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(14px,2.5vw,20px) clamp(20px,4vw,40px)',
        borderBottom: scrolled ? '0.5px solid rgba(255,255,255,.07)' : '0.5px solid transparent',
        background: scrolled ? 'rgba(0,0,0,.93)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all .4s', gap: 16,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', zIndex: 200, flexShrink: 0 }}>
          <APLogo size={42} inverted={true} />
        </Link>

        {/* Desktop: center nav links */}
        <div className="apnav-links" style={{ flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`apnav-item${isActive(link.path) ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop: right side auth */}
        <div className="apnav-links" style={{ gap: 16, flexShrink: 0 }}>
          <button onClick={handleWaitlist} style={{ ...ghostLink, background: 'none', border: 'none' }}
            onMouseOver={e => e.target.style.color='#fff'}
            onMouseOut={e => e.target.style.color='rgba(255,255,255,.38)'}
          >
            Join Waitlist
          </button>
          <div style={{ width: .5, height: 14, background: 'rgba(255,255,255,.12)', flexShrink: 0 }} />
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link to="/dashboard" style={{ ...ghostLink, display: 'flex', alignItems: 'center', gap: 7 }}
                onMouseOver={e => e.currentTarget.style.color='#fff'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.38)'}
              >
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ ...ghostLink, background: 'none', border: 'none' }}
                onMouseOver={e => e.target.style.color='#fff'}
                onMouseOut={e => e.target.style.color='rgba(255,255,255,.38)'}
              >Sign Out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link to="/login" style={ghostLink}
                onMouseOver={e => e.currentTarget.style.color='#fff'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.38)'}
              >Login</Link>
              <Link to="/signup" style={{ background: '#fff', color: '#000', fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: '.22em', textTransform: 'uppercase', padding: '8px 16px', textDecoration: 'none', transition: 'background .2s', display: 'inline-block', whiteSpace: 'nowrap' }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.88)'}
                onMouseOut={e => e.currentTarget.style.background='#fff'}
              >Sign Up</Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button className={`apnav-burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen} style={{ zIndex: 200 }}>
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`apnav-mobile${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Navigation menu">
        <p className="apnav-mobile-section">Navigation</p>
        {NAV_LINKS.map(link => (
          <Link key={link.path} to={link.path} className="apnav-mobile-item">{link.label}</Link>
        ))}

        <p className="apnav-mobile-section">Account</p>
        <button className="apnav-mobile-item" onClick={handleWaitlist}>Join Waitlist</button>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="apnav-mobile-item">Dashboard</Link>
            <button className="apnav-mobile-item" onClick={handleLogout} style={{ borderBottom: 'none' }}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="apnav-mobile-item">Login</Link>
            <Link to="/signup" className="apnav-mobile-item" style={{ borderBottom: 'none' }}>Sign Up</Link>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 48 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.14)' }}>AP Newsletter · 2026</p>
        </div>
      </div>
    </>
  )
}
