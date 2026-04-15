import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import APLogo from './APLogo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiChat, apiSaveIdea, apiDeleteIdea } from '../utils/api.js'

// ─── Simple inline markdown renderer (no deps) ────────────────────────────────
function md(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#fff">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:rgba(255,255,255,.7)">$1</em>')
    .replace(/`(.+?)`/g, '<code style="font-family:monospace;font-size:11px;background:rgba(255,255,255,.08);padding:2px 5px;border-radius:3px">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#fff">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:15px;font-weight:600;margin:12px 0 5px;color:#fff">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:18px;font-weight:400;margin:14px 0 6px;font-family:\'Cormorant Garamond\',serif;color:#fff">$1</h1>')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li style="margin:3px 0;padding-left:4px">$1</li>')
    .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/gs, m => `<ul style="padding-left:18px;margin:6px 0;list-style:disc">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:5px 0">')
    .replace(/\n/g, '<br/>')
    .replace(/^(.+)/, '<p style="margin:0">$1</p>')
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span style={{ display:'flex', gap:4, alignItems:'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:5, height:5, borderRadius:'50%',
          background:'rgba(255,255,255,.3)', display:'inline-block',
          animation:`dbDot 1.25s ease-in-out ${i*.18}s infinite`,
        }}/>
      ))}
      <style>{`@keyframes dbDot{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-5px);opacity:.9}}`}</style>
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div style={{
      border: '0.5px solid rgba(255,255,255,.07)',
      padding: '22px 24px',
      background: 'rgba(255,255,255,.02)',
      flex: 1, minWidth: 0,
    }}>
      <p style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
        {label}
      </p>
      <p style={{ fontSize:28, fontWeight:300, color:'#fff', fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1, marginBottom:4 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize:10.5, color:'rgba(255,255,255,.22)', letterSpacing:'.04em', fontFamily:"'DM Sans',sans-serif" }}>{sub}</p>}
    </div>
  )
}

// ── Saved idea row ─────────────────────────────────────────────────────────────
function IdeaRow({ idea, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        padding:'12px 16px',
        border:'0.5px solid rgba(255,255,255,.06)',
        borderBottom:'none',
        background: hov ? 'rgba(255,255,255,.025)' : 'transparent',
        transition:'background .18s', gap:12,
      }}
    >
      <p style={{ flex:1, fontSize:12.5, color:'rgba(255,255,255,.7)', lineHeight:1.5, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
        {idea.text}
      </p>
      <button
        onClick={() => onDelete(idea._id)}
        style={{
          background:'none', border:'none', cursor:'pointer',
          color: hov ? 'rgba(255,80,80,.6)' : 'rgba(255,255,255,.15)',
          fontSize:16, flexShrink:0, transition:'color .15s', padding:'0 2px', lineHeight:1,
        }}
        title="Remove idea"
      >×</button>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logoutUser, updateUser } = useAuth()

  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput]       = useState('')
  const [chatLoading, setChatLoading]   = useState(false)
  const [sessionId]                     = useState(`dash_${Date.now()}`)
  const chatBottomRef                   = useRef(null)
  const chatInputRef                    = useRef(null)
  const textareaRef                     = useRef(null)

  // Ideas generator state
  const [niche, setNiche]               = useState('')
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState([])

  // Active section
  const [activeSection, setActiveSection] = useState('overview')

  // Saved ideas
  const savedIdeas = user?.savedIdeas || []

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [chatMessages])

  // Greeting based on time
  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  function handleLogout() {
    logoutUser()
    navigate('/')
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || chatLoading) return
    const userMsg = { role:'user', content:trimmed, id:`u${Date.now()}` }
    const typingMsg = { role:'assistant', typing:true, content:'', id:'typing' }
    setChatMessages(p => [...p, userMsg, typingMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const data = await apiChat({ message: trimmed, sessionId })
      const aiMsg = { role:'assistant', content:data.reply, intent:data.intent, id:`a${Date.now()}` }
      setChatMessages(p => [...p.filter(m => m.id!=='typing'), aiMsg])
    } catch (err) {
      setChatMessages(p => [...p.filter(m => m.id!=='typing'), {
        role:'assistant', content:`Error: ${err.message}`, id:`err${Date.now()}`,
      }])
    } finally {
      setChatLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [chatLoading, sessionId])

  function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput) }
  }

  // ── Ideas generator ───────────────────────────────────────────────────────
  async function generateIdeas() {
    if (!niche.trim()) return
    setIdeasLoading(true)
    setGeneratedIdeas([])
    try {
      const data = await apiChat({
        message: `Generate 6 specific, creative newsletter content ideas for a newsletter about: "${niche.trim()}". Format each as a numbered list with a bold title and one-sentence description.`,
        sessionId: `ideas_${Date.now()}`,
      })
      // Parse numbered list items from the response
      const lines = data.reply.split('\n').filter(l => /^\d+\./.test(l.trim()) || /\*\*/.test(l))
      const items = lines.length >= 3
        ? lines.filter(l => l.trim()).slice(0, 6)
        : data.reply.split('\n').filter(l => l.trim().length > 20).slice(0, 6)
      setGeneratedIdeas(items.length > 0 ? items : [data.reply])
    } catch (err) {
      setGeneratedIdeas([`Error: ${err.message}`])
    } finally {
      setIdeasLoading(false)
    }
  }

  async function handleSaveIdea(text) {
    // Strip markdown from text before saving
    const clean = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^\d+\.\s*/, '').trim()
    try {
      const data = await apiSaveIdea(clean)
      if (data.success) updateUser({ savedIdeas: data.savedIdeas })
    } catch (err) { console.error('Save idea error:', err) }
  }

  async function handleDeleteIdea(id) {
    try {
      const data = await apiDeleteIdea(id)
      if (data.success) updateUser({ savedIdeas: data.savedIdeas })
    } catch (err) { console.error('Delete idea error:', err) }
  }

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { id:'overview', label:'Overview',     icon:'◈' },
    { id:'chat',     label:'AI Assistant', icon:'◎' },
    { id:'ideas',    label:'Ideas',        icon:'◇' },
    { id:'saved',    label:'Saved',        icon:'◉', badge: savedIdeas.length || null },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes dbFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dbSpin{to{transform:rotate(360deg)}}
        textarea::placeholder{color:rgba(255,255,255,.2)!important}
        textarea:focus{outline:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#000}
        ::-webkit-scrollbar-thumb{background:#222}
        .db-nav-label { display:inline; }
        .db-user-info { display:block; }
        @media(max-width:640px){
          .db-nav-label { display:none; }
          .db-user-info { display:none; }
        }
      `}</style>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 clamp(16px,4vw,48px)', height:60, flexWrap:'wrap',
        background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)',
        borderBottom:'0.5px solid rgba(255,255,255,.07)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center' }}>
            <APLogo size={34} inverted />
          </Link>
          <div style={{ width:.5, height:20, background:'rgba(255,255,255,.1)' }} />
          <span style={{ fontSize:9, letterSpacing:'.25em', textTransform:'uppercase', color:'rgba(255,255,255,.25)' }}>
            Dashboard
          </span>
        </div>

        {/* Nav items */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                background: activeSection===item.id ? 'rgba(255,255,255,.06)' : 'none',
                border: activeSection===item.id ? '0.5px solid rgba(255,255,255,.1)' : '0.5px solid transparent',
                color: activeSection===item.id ? '#fff' : 'rgba(255,255,255,.35)',
                cursor:'pointer', padding:'6px 14px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11,
                letterSpacing:'.08em', textTransform:'uppercase',
                transition:'all .18s', display:'flex', alignItems:'center', gap:6,
                position:'relative',
              }}
              onMouseEnter={e => { if (activeSection!==item.id) e.currentTarget.style.color='rgba(255,255,255,.7)' }}
              onMouseLeave={e => { if (activeSection!==item.id) e.currentTarget.style.color='rgba(255,255,255,.35)' }}
            >
              <span style={{ fontSize:11 }}>{item.icon}</span>
              <span className="db-nav-label">{item.label}</span>
              {item.badge ? (
                <span style={{
                  minWidth:16, height:16, borderRadius:8,
                  background:'rgba(255,255,255,.9)', color:'#000',
                  fontSize:8, fontWeight:600,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  padding:'0 4px',
                }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="db-user-info" style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,.6)', margin:0, letterSpacing:'.03em' }}>
              {user?.name}
            </p>
            <p style={{ fontSize:9, color:'rgba(255,255,255,.2)', margin:0, letterSpacing:'.08em', textTransform:'uppercase' }}>
              Member
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background:'none', border:'0.5px solid rgba(255,255,255,.12)',
              color:'rgba(255,255,255,.35)', cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif", fontSize:9,
              letterSpacing:'.18em', textTransform:'uppercase',
              padding:'7px 14px', transition:'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,.35)' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,.35)'; e.currentTarget.style.borderColor='rgba(255,255,255,.12)' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main style={{ flex:1, padding:'clamp(24px,4vw,48px)', maxWidth:1100, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeSection === 'overview' && (
          <div style={{ animation:'dbFadeUp .45s ease both' }}>
            {/* Greeting */}
            <div style={{ marginBottom:52 }}>
              <p style={{ fontSize:9, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:14 }}>
                {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
              </p>
              <h1 style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:'clamp(36px,5vw,58px)', fontWeight:300,
                color:'#fff', lineHeight:.95, letterSpacing:'-.02em', marginBottom:16,
              }}>
                {getGreeting()},<br />
                <span style={{ fontStyle:'italic', color:'rgba(255,255,255,.45)' }}>{user?.name?.split(' ')[0]}.</span>
              </h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.3)', letterSpacing:'.04em', maxWidth:480, lineHeight:1.7 }}>
                Your newsletter command centre. Create, strategize, and grow — all in one place.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:0, marginBottom:52, border:'0.5px solid rgba(255,255,255,.07)' }}>
              <StatCard label="Member Since" value={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US',{month:'short',year:'numeric'})} />
              <div style={{ width:.5, background:'rgba(255,255,255,.07)' }} />
              <StatCard label="Saved Ideas" value={savedIdeas.length} sub="In your library" />
              <div style={{ width:.5, background:'rgba(255,255,255,.07)' }} />
              <StatCard label="AI Chats" value="∞" sub="Unlimited access" />
              <div style={{ width:.5, background:'rgba(255,255,255,.07)' }} />
              <StatCard label="Status" value="Active" sub="Free tier" />
            </div>

            {/* Quick actions */}
            <p style={{ fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ display:'inline-block', width:20, height:.5, background:'rgba(255,255,255,.2)' }} />
              Quick Actions
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:0, border:'0.5px solid rgba(255,255,255,.07)' }}>
              {[
                { icon:'◎', title:'Ask AI Assistant', desc:'Get expert newsletter advice instantly', section:'chat', cta:'Open Chat' },
                { icon:'◇', title:'Generate Ideas', desc:'AI-powered content ideas for your niche', section:'ideas', cta:'Generate Now' },
                { icon:'◉', title:'Saved Ideas', desc:`${savedIdeas.length} idea${savedIdeas.length!==1?'s':''} in your library`, section:'saved', cta:'View Library' },
              ].map((item, i) => (
                <QuickActionCard key={i} item={item} onAction={() => setActiveSection(item.section)} isLast={i===2} />
              ))}
            </div>

            {/* Newsletter tips */}
            <div style={{ marginTop:52 }}>
              <p style={{ fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ display:'inline-block', width:20, height:.5, background:'rgba(255,255,255,.2)' }} />
                Today's Growth Tips
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:0, border:'0.5px solid rgba(255,255,255,.07)' }}>
                {TIPS.map((tip, i) => (
                  <TipCard key={i} tip={tip} isLast={i===TIPS.length-1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI CHAT ───────────────────────────────────────────────────────── */}
        {activeSection === 'chat' && (
          <div style={{ animation:'dbFadeUp .4s ease both', display:'flex', flexDirection:'column', height:'calc(100vh - 200px)', minHeight:500 }}>
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ display:'inline-block', width:20, height:.5, background:'rgba(255,255,255,.2)' }} />
                AI Newsletter Assistant
              </p>
              <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:32, fontWeight:300, color:'#fff' }}>
                Ask anything. Get expert answers.
              </h2>
            </div>

            {/* Messages */}
            <div style={{
              flex:1, overflowY:'auto', padding:'16px 0',
              display:'flex', flexDirection:'column', gap:0,
            }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.2)', marginBottom:24, letterSpacing:'.04em' }}>
                    Start a conversation — newsletter expert or general AI
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:600, margin:'0 auto' }}>
                    {CHAT_SUGGESTIONS.map((s,i) => (
                      <button key={i} onClick={() => sendChat(s)}
                        style={{
                          background:'rgba(255,255,255,.03)', border:'0.5px solid rgba(255,255,255,.1)',
                          color:'rgba(255,255,255,.45)', cursor:'pointer',
                          fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                          padding:'7px 14px', transition:'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.8)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.03)'; e.currentTarget.style.color='rgba(255,255,255,.45)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  display:'flex', flexDirection: msg.role==='user' ? 'row-reverse' : 'row',
                  gap:12, marginBottom:20, alignItems:'flex-start',
                  animation:'dbFadeUp .2s ease both',
                }}>
                  <div style={{
                    width:30, height:30, borderRadius:'50%', flexShrink:0, marginTop:2,
                    background: msg.role==='user' ? 'rgba(255,255,255,.9)' : '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:9, fontWeight:700, color:'#000',
                    fontFamily:"'DM Sans',sans-serif", letterSpacing:'.06em',
                  }}>
                    {msg.role==='user' ? 'U' : 'AP'}
                  </div>
                  <div style={{
                    maxWidth:'78%',
                    background: msg.role==='user' ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.04)',
                    color: msg.role==='user' ? '#000' : 'rgba(255,255,255,.85)',
                    border: msg.role==='user' ? 'none' : '0.5px solid rgba(255,255,255,.08)',
                    borderRadius: msg.role==='user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                    padding:'10px 14px', fontSize:13, lineHeight:1.65,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>
                    {msg.typing ? <TypingDots /> : msg.role==='user'
                      ? <span style={{ whiteSpace:'pre-wrap' }}>{msg.content}</span>
                      : <div dangerouslySetInnerHTML={{ __html: md(msg.content) }} />
                    }
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop:'0.5px solid rgba(255,255,255,.07)', paddingTop:16 }}>
              <div style={{
                display:'flex', gap:10, alignItems:'flex-end',
                border:'0.5px solid rgba(255,255,255,.12)',
                background:'rgba(255,255,255,.02)', padding:'8px 10px 8px 16px',
              }}>
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleChatKey}
                  disabled={chatLoading}
                  placeholder="Ask about newsletters, growth, content strategy, or anything…"
                  rows={1}
                  style={{
                    flex:1, background:'none', border:'none', resize:'none',
                    color:'rgba(255,255,255,.87)', fontFamily:"'DM Sans',sans-serif",
                    fontSize:13, lineHeight:1.5, maxHeight:100, minHeight:20,
                    overflowY:'auto', padding:0, caretColor:'#fff',
                  }}
                  onInput={e => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px' }}
                />
                <button
                  onClick={() => sendChat(chatInput)}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{
                    width:34, height:34, border:'none', borderRadius:2,
                    background: chatInput.trim() && !chatLoading ? '#fff' : 'rgba(255,255,255,.06)',
                    cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all .15s', flexShrink:0,
                  }}
                >
                  {chatLoading
                    ? <div style={{ width:13, height:13, border:'1.5px solid rgba(255,255,255,.15)', borderTop:'1.5px solid rgba(255,255,255,.6)', borderRadius:'50%', animation:'dbSpin .6s linear infinite' }}/>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 11.5L11.5 6.5L1.5 1.5V5.5L8 6.5L1.5 7.5V11.5Z" fill={chatInput.trim()?'#000':'rgba(255,255,255,.2)'}/></svg>
                  }
                </button>
              </div>
              <p style={{ fontSize:9, color:'rgba(255,255,255,.1)', textAlign:'center', marginTop:6, letterSpacing:'.1em', textTransform:'uppercase' }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* ── IDEAS GENERATOR ───────────────────────────────────────────────── */}
        {activeSection === 'ideas' && (
          <div style={{ animation:'dbFadeUp .4s ease both' }}>
            <div style={{ marginBottom:36 }}>
              <p style={{ fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ display:'inline-block', width:20, height:.5, background:'rgba(255,255,255,.2)' }} />
                Content Ideas Generator
              </p>
              <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:32, fontWeight:300, color:'#fff', marginBottom:10 }}>
                Never run out of ideas.
              </h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', letterSpacing:'.04em', lineHeight:1.7 }}>
                Enter your newsletter niche and get 6 tailored content ideas instantly.
              </p>
            </div>

            {/* Niche input */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:0, maxWidth:600, marginBottom:40 }}>
              <input
                type="text"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') generateIdeas() }}
                placeholder="e.g. fintech for millennials, B2B SaaS, wellness…"
                style={{
                  padding:'13px 18px',
                  background:'rgba(255,255,255,.03)',
                  border:'0.5px solid rgba(255,255,255,.15)',
                  borderRight:'none',
                  minWidth:'0', flex:'1 1 200px',
                  color:'#fff', fontFamily:"'DM Sans',sans-serif",
                  fontSize:13, letterSpacing:'.03em',
                  boxSizing:'border-box',
                }}
              />
              <button
                onClick={generateIdeas}
                disabled={ideasLoading || !niche.trim()}
                style={{
                  padding:'13px 28px',
                  background: niche.trim() && !ideasLoading ? '#fff' : 'rgba(255,255,255,.1)',
                  color: niche.trim() && !ideasLoading ? '#000' : 'rgba(255,255,255,.2)',
                  border: '0.5px solid rgba(255,255,255,.15)',
                  cursor: niche.trim() && !ideasLoading ? 'pointer' : 'not-allowed',
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:9, fontWeight:500, letterSpacing:'.2em', textTransform:'uppercase',
                  transition:'all .2s', flexShrink:0,
                  display:'flex', alignItems:'center', gap:8,
                }}
              >
                {ideasLoading
                  ? <><div style={{ width:11, height:11, border:'1.5px solid rgba(0,0,0,.2)', borderTop:'1.5px solid #000', borderRadius:'50%', animation:'dbSpin .6s linear infinite' }}/> Generating…</>
                  : 'Generate Ideas'
                }
              </button>
            </div>

            {/* Generated ideas */}
            {generatedIdeas.length > 0 && (
              <div style={{ animation:'dbFadeUp .3s ease both' }}>
                <p style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:16 }}>
                  {generatedIdeas.length} ideas for "{niche}"
                </p>
                <div style={{ border:'0.5px solid rgba(255,255,255,.08)' }}>
                  {generatedIdeas.map((idea, i) => {
                    const isAlreadySaved = savedIdeas.some(s => s.text.includes(idea.replace(/\*\*/g,'').replace(/^\d+\.\s*/,'').slice(0,30)))
                    return (
                      <div key={i} style={{
                        padding:'16px 20px',
                        borderBottom: i < generatedIdeas.length-1 ? '0.5px solid rgba(255,255,255,.06)' : 'none',
                        display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16,
                        background:'rgba(255,255,255,.01)',
                      }}>
                        <div style={{ flex:1 }}>
                          <div
                            style={{ fontSize:13, color:'rgba(255,255,255,.78)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}
                            dangerouslySetInnerHTML={{ __html: md(idea) }}
                          />
                        </div>
                        <button
                          onClick={() => handleSaveIdea(idea)}
                          disabled={isAlreadySaved}
                          style={{
                            background:'none',
                            border:`0.5px solid ${isAlreadySaved ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.18)'}`,
                            color: isAlreadySaved ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.5)',
                            cursor: isAlreadySaved ? 'default' : 'pointer',
                            fontFamily:"'DM Sans',sans-serif",
                            fontSize:9, letterSpacing:'.15em', textTransform:'uppercase',
                            padding:'5px 12px', transition:'all .15s', flexShrink:0,
                          }}
                          onMouseEnter={e => { if (!isAlreadySaved) { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,.4)' }}}
                          onMouseLeave={e => { if (!isAlreadySaved) { e.currentTarget.style.color='rgba(255,255,255,.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,.18)' }}}
                        >
                          {isAlreadySaved ? '✓ Saved' : '+ Save'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Niche suggestions */}
            {generatedIdeas.length === 0 && !ideasLoading && (
              <div>
                <p style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,.15)', marginBottom:14 }}>
                  Popular niches to try
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {NICHES.map((n,i) => (
                    <button key={i} onClick={() => setNiche(n)}
                      style={{
                        background:'rgba(255,255,255,.03)', border:'0.5px solid rgba(255,255,255,.09)',
                        color:'rgba(255,255,255,.4)', cursor:'pointer',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                        padding:'6px 14px', transition:'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.75)' }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.03)'; e.currentTarget.style.color='rgba(255,255,255,.4)' }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED IDEAS ───────────────────────────────────────────────────── */}
        {activeSection === 'saved' && (
          <div style={{ animation:'dbFadeUp .4s ease both' }}>
            <div style={{ marginBottom:36 }}>
              <p style={{ fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ display:'inline-block', width:20, height:.5, background:'rgba(255,255,255,.2)' }} />
                Your Idea Library
              </p>
              <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:32, fontWeight:300, color:'#fff', marginBottom:10 }}>
                Saved ideas{savedIdeas.length > 0 && <span style={{ color:'rgba(255,255,255,.3)', fontStyle:'italic' }}> — {savedIdeas.length}</span>}
              </h2>
            </div>

            {savedIdeas.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <p style={{ fontSize:28, fontFamily:"'Cormorant Garamond',serif", color:'rgba(255,255,255,.15)', marginBottom:16 }}>
                  Your library is empty.
                </p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.2)', marginBottom:28, letterSpacing:'.04em' }}>
                  Generate ideas and save the ones you love.
                </p>
                <button
                  onClick={() => setActiveSection('ideas')}
                  style={{
                    background:'#fff', color:'#000', border:'none',
                    fontFamily:"'DM Sans',sans-serif",
                    fontSize:9, fontWeight:500, letterSpacing:'.22em', textTransform:'uppercase',
                    padding:'12px 28px', cursor:'pointer',
                  }}
                >
                  Generate Ideas
                </button>
              </div>
            ) : (
              <div style={{ border:'0.5px solid rgba(255,255,255,.08)' }}>
                {savedIdeas.map(idea => (
                  <IdeaRow key={idea._id} idea={idea} onDelete={handleDeleteIdea} />
                ))}
                <div style={{ borderTop:'0.5px solid rgba(255,255,255,.06)', padding:'10px 16px' }}>
                  <p style={{ fontSize:9.5, color:'rgba(255,255,255,.2)', letterSpacing:'.08em' }}>
                    {savedIdeas.length} idea{savedIdeas.length!==1?'s':''} saved · Ideas sync across sessions
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function QuickActionCard({ item, onAction, isLast }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:'32px 28px',
        borderRight: isLast ? 'none' : '0.5px solid rgba(255,255,255,.07)',
        borderBottom: '0.5px solid rgba(255,255,255,.07)',
        background: hov ? 'rgba(255,255,255,.025)' : 'transparent',
        transition:'background .25s', cursor:'pointer',
        position:'relative', overflow:'hidden',
      }}
      onClick={onAction}
    >
      <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderTop:'14px solid rgba(255,255,255,.06)', borderLeft:'14px solid transparent' }} />
      <p style={{ fontSize:18, marginBottom:16 }}>{item.icon}</p>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:400, color:'#fff', marginBottom:8 }}>
        {item.title}
      </h3>
      <p style={{ fontSize:11.5, color:'rgba(255,255,255,.3)', letterSpacing:'.03em', lineHeight:1.6, marginBottom:20 }}>
        {item.desc}
      </p>
      <span style={{
        fontSize:8.5, letterSpacing:'.2em', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.3)',
        borderBottom:'0.5px solid', borderColor: hov ? 'rgba(255,255,255,.4)' : 'transparent',
        paddingBottom:1, transition:'all .2s',
      }}>
        {item.cta} →
      </span>
    </div>
  )
}

function TipCard({ tip, isLast }) {
  return (
    <div style={{
      padding:'24px 22px',
      borderRight: isLast ? 'none' : '0.5px solid rgba(255,255,255,.07)',
    }}>
      <p style={{ fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.15)', marginBottom:12 }}>
        {tip.category}
      </p>
      <p style={{ fontSize:13, color:'rgba(255,255,255,.65)', lineHeight:1.65, letterSpacing:'.02em' }}>
        {tip.text}
      </p>
    </div>
  )
}

// ── Static data ───────────────────────────────────────────────────────────────
const TIPS = [
  { category:'Open Rates', text:'Subject lines with 6-10 words get 21% higher open rates. Test curiosity-gap phrasing vs direct benefit statements.' },
  { category:'Engagement', text:'Ending every issue with a single question and inviting readers to reply can 5x your reply rate within 30 days.' },
  { category:'Growth', text:'Your welcome email gets 50-80% open rates. Use it to set expectations, deliver immediate value, and ask one question.' },
]

const NICHES = [
  'Personal finance', 'B2B SaaS', 'Climate tech', 'Creator economy',
  'Health & longevity', 'AI & automation', 'Real estate', 'Crypto & Web3',
  'Marketing strategy', 'Product management', 'Startup stories', 'Career growth',
]

const CHAT_SUGGESTIONS = [
  'How do I grow from 0 to 5K subscribers?',
  'What should my welcome email say?',
  'How do I find my first newsletter sponsor?',
  'Give me a 90-day newsletter growth plan',
]
