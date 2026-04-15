import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import APLogo from './APLogo.jsx'
import { apiSignup } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Divider } from './ui.jsx'

export default function Signup() {
  const navigate      = useNavigate()
  const { loginUser } = useAuth()

  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]       = useState({})
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPwd, setShowPwd]     = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [minimized, setMinimized] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(ev => { const n = { ...ev }; delete n[name]; return n })
    if (apiError) setApiError('')
  }

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true); setApiError('')
    try {
      const data = await apiSignup({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      if (data.success) { loginUser(data.token, data.user); navigate('/dashboard', { replace: true }) }
    } catch (err) {
      setApiError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Minimized pill ─────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
        <style>{`@keyframes sPillIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}`}</style>
        <button onClick={() => setMinimized(false)} aria-label="Restore signup"
          style={{ position:'fixed', bottom:32, right:32, zIndex:9995, background:'#fff', color:'#000', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:'.2em', textTransform:'uppercase', padding:'10px 20px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.6)', animation:'sPillIn .3s cubic-bezier(.16,1,.3,1) both' }}>
          <span style={{ fontSize:14 }}>✨</span> Create Account
        </button>
        <Link to="/" style={{ position:'fixed', top:28, left:32, display:'flex', textDecoration:'none' }}><APLogo size={34} inverted /></Link>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:'rgba(255,255,255,.15)', fontWeight:300 }}>Signup minimized</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(80px,12vw,120px) clamp(20px,5vw,40px) 40px', position:'relative', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes sFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #0a0a0a inset!important;-webkit-text-fill-color:#fff!important}
      `}</style>

      <div style={{ position:'absolute', top:0, left:'30%', width:.5, height:'100%', background:'rgba(255,255,255,.025)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, right:'30%', width:.5, height:'100%', background:'rgba(255,255,255,.025)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, width:0, height:0, borderBottom:'60px solid rgba(255,255,255,.03)', borderRight:'60px solid transparent', pointerEvents:'none' }} />

      <Link to="/" style={{ position:'fixed', top:'clamp(16px,3vw,28px)', left:'clamp(20px,4vw,48px)', display:'flex', textDecoration:'none', zIndex:10 }}>
        <APLogo size={36} inverted />
      </Link>

      {/* Minimize */}
      <button onClick={() => setMinimized(true)} title="Minimize"
        style={{ position:'fixed', top:'clamp(20px,3vw,30px)', right:'clamp(20px,4vw,40px)', background:'none', border:'0.5px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.3)', cursor:'pointer', zIndex:10, fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', padding:'6px 14px', transition:'all .2s', display:'flex', alignItems:'center', gap:6 }}
        onMouseEnter={e => { e.currentTarget.style.color='rgba(255,255,255,.7)'; e.currentTarget.style.borderColor='rgba(255,255,255,.3)' }}
        onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,.3)'; e.currentTarget.style.borderColor='rgba(255,255,255,.12)' }}
      >
        <span style={{ fontSize:14, lineHeight:1 }}>—</span> Minimize
      </button>

      <div style={{ width:'100%', maxWidth:440, animation:'sFadeUp .5s cubic-bezier(.16,1,.3,1) both' }}>
        <p style={{ fontSize:9, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:18, textAlign:'center' }}>AP Newsletter</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(30px,6vw,38px)', fontWeight:300, color:'#fff', textAlign:'center', lineHeight:1.05, marginBottom:8 }}>
          Join AP Newsletter.
        </h1>
        <p style={{ fontSize:12, color:'rgba(255,255,255,.26)', textAlign:'center', letterSpacing:'.04em', marginBottom:36 }}>
          Create your free account — it takes 30 seconds.
        </p>

        {apiError && (
          <div style={{ background:'rgba(255,40,40,.06)', border:'0.5px solid rgba(255,80,80,.25)', padding:'10px 16px', marginBottom:20, fontSize:12, color:'rgba(255,120,120,.9)', letterSpacing:'.02em', lineHeight:1.5 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input type="text" name="name" value={form.name} onChange={handleChange}
            autoComplete="name" placeholder="Your full name" label="Full name"
            error={errors.name} disabled={loading} />
          <Input type="email" name="email" value={form.email} onChange={handleChange}
            autoComplete="email" placeholder="your@email.com" label="Email address"
            error={errors.email} disabled={loading} />
          <Input type={showPwd ? 'text' : 'password'} name="password" value={form.password}
            onChange={handleChange} autoComplete="new-password" placeholder="Min 8 characters"
            label="Password" error={errors.password} disabled={loading}
            rightElement={
              <button type="button" onClick={() => setShowPwd(p=>!p)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:11, letterSpacing:'.08em', fontFamily:"'DM Sans',sans-serif", transition:'color .2s', padding:0 }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}
              >{showPwd?'HIDE':'SHOW'}</button>
            }
          />
          <Input type={showCfm ? 'text' : 'password'} name="confirm" value={form.confirm}
            onChange={handleChange} autoComplete="new-password" placeholder="Repeat password"
            label="Confirm password" error={errors.confirm} disabled={loading}
            rightElement={
              <button type="button" onClick={() => setShowCfm(p=>!p)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:11, letterSpacing:'.08em', fontFamily:"'DM Sans',sans-serif", transition:'color .2s', padding:0 }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}
              >{showCfm?'HIDE':'SHOW'}</button>
            }
          />
          <div style={{ marginTop:8 }}>
            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </div>
        </form>

        <Divider label="or" />
        <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,.28)', letterSpacing:'.03em' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'rgba(255,255,255,.65)', textDecoration:'none', borderBottom:'0.5px solid rgba(255,255,255,.25)', paddingBottom:1, transition:'color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.65)'}
          >Sign in</Link>
        </p>
      </div>
    </div>
  )
}
