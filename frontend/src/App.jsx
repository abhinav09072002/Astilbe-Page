import React, { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import LoadingScreen from './components/LoadingScreen.jsx'
import Navbar        from './components/Navbar.jsx'
import Hero          from './components/Hero.jsx'
import { Ticker1, Ticker2 } from './components/Ticker.jsx'
import About         from './components/About.jsx'
import Features      from './components/Features.jsx'
import Waitlist      from './components/Waitlist.jsx'
import Social        from './components/Social.jsx'
import Results       from './components/Results.jsx'
import Footer        from './components/Footer.jsx'
import ChatWidget    from './components/ChatWidget.jsx'
import Login         from './components/Login.jsx'
import Signup        from './components/Signup.jsx'
import Dashboard     from './components/Dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { PlatformPage, SolutionsPage, ResourcesPage, EnterprisesPage, AdNetworkingPage, PricingPage } from './components/Pages.jsx'

const API_URL = import.meta.env.VITE_API_URL || '/api'
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) }

function HomePage() {
  const [loaded, setLoaded]               = useState(false)
  const [subscribers, setSubscribers]     = useState([])
  const [totalCount, setTotalCount]       = useState(2000)
  const [heroSubmitted, setHeroSubmitted] = useState(false)
  const [wlSubmitted, setWlSubmitted]     = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState(null)

  const handleLoaded = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    fetch(`${API_URL}/waitlist/count`)
      .then(r => r.json())
      .then(data => { if (data.success) setTotalCount(data.count + 2000) })
      .catch(() => {})
  }, [])

  const handleSubmit = useCallback(async (email, source) => {
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
    if (submitting) return
    setError(null); setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email.trim().toLowerCase(),source}) })
      const data = await res.json()
      if (data.success || data.alreadySubscribed) {
        const norm = email.trim().toLowerCase()
        setSubscribers(prev => prev.find(s=>s.email===norm)?prev:[...prev,{email:norm,ts:Date.now()}])
        if (data.data?.totalSubscribers) setTotalCount(data.data.totalSubscribers+2000)
        if (source==='hero') setHeroSubmitted(true)
        if (source==='wl')   setWlSubmitted(true)
        setTimeout(()=>document.getElementById('results')?.scrollIntoView({behavior:'smooth'}),500)
      } else {
        setError(data.message||'Something went wrong. Please try again.')
      }
    } catch {
      setError('Cannot reach server. Make sure the backend is running on port 5000.')
    } finally { setSubmitting(false) }
  }, [submitting])

  return (
    <>
      <div className="grain" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }} aria-hidden />
      {!loaded && <LoadingScreen onDone={handleLoaded} />}
      {error && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#fff', color:'#000', padding:'12px 20px', fontFamily:"'DM Sans',sans-serif", fontSize:12, letterSpacing:'.04em', zIndex:9997, border:'0.5px solid rgba(0,0,0,.15)', whiteSpace:'normal', maxWidth:'calc(100vw - 40px)', width:'max-content', textAlign:'center' }}>
          {error}
          <button onClick={()=>setError(null)} style={{ marginLeft:16, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>×</button>
        </div>
      )}
      <div style={{ opacity:loaded?1:0, transition:'opacity .7s' }}>
        <Navbar />
        <main>
          <Hero onSubmit={e=>handleSubmit(e,'hero')} submitted={heroSubmitted} submitting={submitting} totalCount={totalCount} />
          <Ticker1 />
          <About />
          <Features />
          <Ticker2 />
          <Waitlist onSubmit={e=>handleSubmit(e,'wl')} submitted={wlSubmitted} submitting={submitting} totalCount={totalCount} />
          <Social />
          <div id="results"><Results subscribers={subscribers} /></div>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:"'DM Sans',sans-serif" }}>
      <p style={{ fontSize:9, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.2)' }}>404</p>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'rgba(255,255,255,.4)' }}>Page not found.</p>
      <a href="/" style={{ fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', textDecoration:'none', borderBottom:'0.5px solid rgba(255,255,255,.2)', paddingBottom:2 }}>Back to home →</a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<HomePage />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/signup"       element={<Signup />} />
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/platform"     element={<PlatformPage />} />
      <Route path="/solutions"    element={<SolutionsPage />} />
      <Route path="/resources"    element={<ResourcesPage />} />
      <Route path="/enterprises"  element={<EnterprisesPage />} />
      <Route path="/ad-networking"element={<AdNetworkingPage />} />
      <Route path="/pricing"      element={<PricingPage />} />
      <Route path="*"             element={<NotFound />} />
    </Routes>
  )
}
