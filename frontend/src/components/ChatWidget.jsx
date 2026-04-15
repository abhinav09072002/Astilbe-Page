import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

// ─── Markdown renderer ────────────────────────────────────────────────────────
function md(text) {
  if (!text) return ''
  let html = text
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_m, code) =>
      `<pre style="background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.1);padding:10px 13px;margin:8px 0;overflow-x:auto;font-family:monospace;font-size:11.5px;line-height:1.5;border-radius:2px"><code>${escHtml(code.trim())}</code></pre>`)
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;margin:12px 0 5px;color:#fff">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:14.5px;font-weight:600;margin:14px 0 6px;color:#fff">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:16px;font-weight:600;margin:16px 0 7px;color:#fff;font-family:\'Cormorant Garamond\',Georgia,serif">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em style="color:rgba(255,255,255,.9)">$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#fff">$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em style="font-style:italic;color:rgba(255,255,255,.75)">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="font-family:monospace;font-size:11px;background:rgba(255,255,255,.09);padding:2px 5px;border-radius:3px;color:rgba(255,255,255,.9)">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:2px solid rgba(255,255,255,.2);padding-left:12px;margin:6px 0;color:rgba(255,255,255,.55);font-style:italic">$1</blockquote>')
    .replace(/^[-•*] (.+)$/gm, '<li class="culi" style="margin:3px 0;padding-left:2px">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="coli" style="margin:3px 0;padding-left:2px">$1</li>')
    .replace(/((?:<li class="coli"[^>]*>.*<\/li>\n?)+)/g, m=>`<ol style="padding-left:20px;margin:6px 0;list-style:decimal">${m.replace(/class="coli"/g,'')}</ol>`)
    .replace(/((?:<li class="culi"[^>]*>.*<\/li>\n?)+)/g, m=>`<ul style="padding-left:18px;margin:6px 0;list-style:disc">${m.replace(/class="culi"/g,'')}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:5px 0">')
    .replace(/\n/g, '<br/>')
  return `<p style="margin:0">${html}</p>`
}
function escHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, alignItems:'center', height:18 }}>
      {[0,1,2].map(i=>(
        <span key={i} style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,.3)', display:'inline-block', animation:`cwDot 1.25s ease-in-out ${i*.18}s infinite` }}/>
      ))}
      <style>{`@keyframes cwDot{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-5px);opacity:.9}}`}</style>
    </div>
  )
}

const INTENT_META = {
  newsletter: { label:'Newsletter Expert', color:'rgba(99,180,255,.9)',  bg:'rgba(99,180,255,.08)' },
  ideas:      { label:'Ideas Generator',   color:'rgba(167,243,208,.9)', bg:'rgba(167,243,208,.08)' },
  engagement: { label:'Engagement Mode',   color:'rgba(251,191,36,.9)',  bg:'rgba(251,191,36,.08)' },
  marketing:  { label:'Marketing Expert',  color:'rgba(248,113,113,.9)', bg:'rgba(248,113,113,.08)' },
  general:    { label:'General Chat',      color:'rgba(255,255,255,.45)',bg:'rgba(255,255,255,.04)' },
}

function IntentBadge({ intent }) {
  const m = INTENT_META[intent] || INTENT_META.general
  return <span style={{ fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:m.color, background:m.bg, padding:'2px 7px', borderRadius:2, fontFamily:"'DM Sans',sans-serif", fontWeight:500, border:`0.5px solid ${m.color.replace('.9','.2')}` }}>{m.label}</span>
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800) }) }}
      style={{ background:'none', border:'none', cursor:'pointer', color:copied?'rgba(167,243,208,.8)':'rgba(255,255,255,.2)', padding:'2px 4px', fontSize:10, transition:'color .2s', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.05em' }}>
      {copied?'✓ copied':'copy'}
    </button>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ display:'flex', flexDirection:isUser?'row-reverse':'row', alignItems:'flex-start', gap:9, marginBottom:16, animation:'cwFadeUp .2s ease both' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, marginTop:2, background:isUser?'rgba(255,255,255,.9)':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#000', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.04em', border:isUser?'none':'0.5px solid rgba(255,255,255,.15)' }}>
        {isUser?'U':'AP'}
      </div>
      <div style={{ flex:1, minWidth:0, maxWidth:isUser?'80%':'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, justifyContent:isUser?'flex-end':'flex-start' }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.25)', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase' }}>{isUser?'You':'AP Newsletter AI'}</span>
          {!isUser && msg.intent && <IntentBadge intent={msg.intent} />}
        </div>
        <div style={{ background:isUser?'rgba(255,255,255,.9)':'rgba(255,255,255,.045)', color:isUser?'#000':'rgba(255,255,255,.87)', border:isUser?'none':'0.5px solid rgba(255,255,255,.08)', borderRadius:isUser?'14px 14px 3px 14px':'3px 14px 14px 14px', padding:isUser?'9px 14px':'11px 15px', fontSize:13, lineHeight:1.65, letterSpacing:'.012em', fontFamily:"'DM Sans',sans-serif", wordBreak:'break-word' }}>
          {msg.typing ? <TypingDots /> : isUser
            ? <span style={{ whiteSpace:'pre-wrap' }}>{msg.content}</span>
            : <div dangerouslySetInnerHTML={{ __html: md(msg.content) }} />
          }
        </div>
        {!msg.typing && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, justifyContent:isUser?'flex-end':'flex-start', opacity:hovered?1:0, transition:'opacity .15s' }}>
            {!isUser && <CopyBtn text={msg.content} />}
            <span style={{ fontSize:9.5, color:'rgba(255,255,255,.18)', fontFamily:"'DM Sans',sans-serif" }}>
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { text:'How do I grow from 0 to 10K subscribers?', icon:'📈' },
  { text:'Give me 5 content ideas for my newsletter',  icon:'💡' },
  { text:'What should my welcome email say?',          icon:'✉️' },
  { text:'How do I monetize at 5K subscribers?',       icon:'💰' },
  { text:'What makes a great subject line?',           icon:'🎯' },
  { text:'Explain how RAG works in AI',                icon:'🤖' },
]

function HistoryItem({ session, isActive, onSelect, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderRadius:2, cursor:'pointer', background:isActive?'rgba(255,255,255,.07)':hov?'rgba(255,255,255,.03)':'transparent', transition:'background .15s', marginBottom:1 }}
      onClick={()=>onSelect(session.id)}>
      <span style={{ fontSize:11.5, color:isActive?'#fff':'rgba(255,255,255,.45)', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, minWidth:0 }}>{session.title||'New Chat'}</span>
      {hov && <button onClick={e=>{e.stopPropagation();onDelete(session.id)}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:14, padding:'0 0 0 6px', lineHeight:1, flexShrink:0 }}>×</button>}
    </div>
  )
}

let sessionCounter = 0
function newSession() { return { id:`sess_${++sessionCounter}_${Date.now()}`, title:'New Chat', messages:[], createdAt:Date.now() } }

export default function ChatWidget() {
  const [open, setOpen]               = useState(false)
  const [minimized, setMinimized]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions]       = useState([newSession()])
  const [activeId, setActiveId]       = useState(sessions[0].id)
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [initialized, setInitialized] = useState(false)
  const bottomRef    = useRef(null)
  const textareaRef  = useRef(null)
  const API_URL      = import.meta.env.VITE_API_URL || '/api'

  // responsive: panel dimensions
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 520
  const panelW   = isMobile ? 'calc(100vw - 16px)' : '420px'
  const panelH   = isMobile ? 'calc(100vh - 80px)' : '580px'
  const panelRight= isMobile ? '8px' : '28px'
  const panelBottom= isMobile ? '76px' : '94px'

  const activeSession = useMemo(()=>sessions.find(s=>s.id===activeId)||sessions[0],[sessions,activeId])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[activeSession?.messages])

  useEffect(()=>{
    if (open) {
      setTimeout(()=>textareaRef.current?.focus(), 150)
      if (!initialized) {
        setInitialized(true)
        injectMsg(sessions[0].id, { role:'assistant', content:`# Hey there! I'm AP Newsletter AI 👋\n\nDual-mode AI — general questions **or** newsletter expert mode.\n\n- **Newsletter growth** — subscribers, open rates, deliverability\n- **Content strategy** — ideas, editorial planning\n- **Monetization** — sponsorships, paid tiers, revenue\n- **General questions** — anything, like ChatGPT\n\nWhat are you working on today?`, intent:'general', timestamp:new Date().toISOString() })
      }
    }
  },[open])

  useEffect(()=>{
    const h = e => { if (e.key==='Escape') { setOpen(false); setMinimized(false) } }
    window.addEventListener('keydown',h)
    return ()=>window.removeEventListener('keydown',h)
  },[])

  useEffect(()=>{
    if (textareaRef.current) {
      textareaRef.current.style.height='auto'
      textareaRef.current.style.height=Math.min(textareaRef.current.scrollHeight,120)+'px'
    }
  },[input])

  function injectMsg(sessionId, msg) {
    setSessions(prev=>prev.map(s=>s.id===sessionId ? { ...s, messages:[...s.messages,msg], title:s.messages.length===0&&msg.role==='user' ? msg.content.slice(0,42)+(msg.content.length>42?'…':''):s.title } : s))
  }

  const sendMessage = useCallback(async(text)=>{
    const trimmed = text.trim()
    if (!trimmed||loading) return
    const userMsg = { role:'user', content:trimmed, timestamp:new Date().toISOString(), id:`u_${Date.now()}` }
    const typingMsg = { role:'assistant', typing:true, content:'', id:'typing' }
    setSessions(prev=>prev.map(s=>s.id===activeId ? { ...s, messages:[...s.messages,userMsg,typingMsg], title:s.messages.filter(m=>m.role==='user').length===0 ? trimmed.slice(0,42)+(trimmed.length>42?'…':'') : s.title } : s))
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:trimmed,sessionId:activeId}) })
      const data = await res.json()
      if (!res.ok||!data.success) throw new Error(data.message||`Error ${res.status}`)
      const aiMsg = { role:'assistant', content:data.reply, intent:data.intent, timestamp:new Date().toISOString(), id:`a_${Date.now()}` }
      setSessions(prev=>prev.map(s=>s.id===activeId ? { ...s, messages:[...s.messages.filter(m=>m.id!=='typing'),aiMsg] } : s))
    } catch(err) {
      const errMsg = { role:'assistant', content:`⚠️ **Connection error**\n\n${err.message}\n\nMake sure the backend is running:\n\`cd backend && npm run dev\``, timestamp:new Date().toISOString(), id:`err_${Date.now()}` }
      setSessions(prev=>prev.map(s=>s.id===activeId ? { ...s, messages:[...s.messages.filter(m=>m.id!=='typing'),errMsg] } : s))
    } finally {
      setLoading(false)
      setTimeout(()=>textareaRef.current?.focus(),50)
    }
  },[activeId,loading,API_URL])

  function handleKeyDown(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(input)} }
  function handleNewChat() { const s=newSession(); setSessions(p=>[s,...p]); setActiveId(s.id) }
  function handleDeleteSession(id) { setSessions(p=>{ const f=p.filter(s=>s.id!==id); if(f.length===0){const s=newSession();setActiveId(s.id);return[s]}; if(id===activeId)setActiveId(f[0].id); return f }) }
  function handleClearChat() { setSessions(p=>p.map(s=>s.id===activeId?{...s,messages:[],title:'New Chat'}:s)) }

  const isEmpty = activeSession.messages.length===0||(activeSession.messages.length===1&&activeSession.messages[0].role==='assistant')

  // ── Minimized pill ─────────────────────────────────────────────────────────
  const MinimizedPill = () => (
    <button onClick={()=>{setMinimized(false);setOpen(true)}} aria-label="Restore chat"
      style={{ position:'fixed', bottom:28, right:28, zIndex:9990, background:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:'10px 18px', boxShadow:'0 6px 28px rgba(0,0,0,.65)', animation:'cwBtnIn .3s cubic-bezier(.16,1,.3,1) both', fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:'.18em', textTransform:'uppercase', color:'#000' }}>
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M11 2C6.03 2 2 5.8 2 10.5c0 1.95.68 3.75 1.82 5.2L2 21l4.65-1.52A9.7 9.7 0 0011 20c4.97 0 9-3.8 9-8.5S15.97 2 11 2z" fill="#000"/></svg>
      Chat
    </button>
  )

  return (
    <>
      <style>{`
        @keyframes cwFadeUp  {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cwPanelIn {from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes cwBtnIn   {from{opacity:0;transform:scale(.75)}to{opacity:1;transform:scale(1)}}
        @keyframes cwPulse   {0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.15)}60%{box-shadow:0 0 0 9px rgba(255,255,255,0)}}
        .cw-scrollbar::-webkit-scrollbar{width:3px}
        .cw-scrollbar::-webkit-scrollbar-track{background:transparent}
        .cw-scrollbar::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:99px}
      `}</style>

      {/* Minimized pill */}
      {minimized && !open && <MinimizedPill />}

      {/* Floating button (only when not minimized) */}
      {!minimized && (
        <button aria-label={open?'Close chat':'Open AI chat'} onClick={()=>setOpen(o=>!o)}
          style={{ position:'fixed', bottom:28, right:28, zIndex:9990, width:54, height:54, borderRadius:'50%', background:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:open?'0 2px 12px rgba(0,0,0,.4)':'0 6px 28px rgba(0,0,0,.65)', transition:'all .25s cubic-bezier(.16,1,.3,1)', animation:'cwBtnIn .35s cubic-bezier(.16,1,.3,1) .5s both, cwPulse 2.5s ease 2s 3', transform:open?'rotate(45deg) scale(1)':'scale(1)' }}
          onMouseEnter={e=>{if(!open){e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.7)'}}}
          onMouseLeave={e=>{if(!open){e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 6px 28px rgba(0,0,0,.65)'}}}
        >
          {open
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C7.03 3 3 6.8 3 11.5c0 1.95.68 3.75 1.82 5.2L3 21l4.65-1.52A9.7 9.7 0 0012 20c4.97 0 9-3.8 9-8.5S16.97 3 12 3z" fill="#000"/><circle cx="8.5" cy="11.5" r="1.2" fill="#fff"/><circle cx="12" cy="11.5" r="1.2" fill="#fff"/><circle cx="15.5" cy="11.5" r="1.2" fill="#fff"/></svg>
          }
        </button>
      )}

      {/* "Ask our AI" tooltip */}
      {!initialized && !open && !minimized && (
        <div style={{ position:'fixed', bottom:94, right:28, zIndex:9991, background:'#fff', color:'#000', fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif", fontWeight:500, padding:'5px 12px', whiteSpace:'nowrap', border:'0.5px solid rgba(0,0,0,.1)', animation:'cwFadeUp .4s ease .9s both', pointerEvents:'none' }}>
          Ask our AI ✦
        </div>
      )}

      {/* Chat panel */}
      {open && !minimized && (
        <div role="dialog" aria-label="AP Newsletter AI Chat"
          style={{ position:'fixed', bottom:panelBottom, right:panelRight, zIndex:9989, width:panelW, height:panelH, background:'#0a0a0a', border:'0.5px solid rgba(255,255,255,.1)', display:'flex', overflow:'hidden', animation:'cwPanelIn .26s cubic-bezier(.16,1,.3,1) both', boxShadow:'0 32px 80px rgba(0,0,0,.75), 0 0 0 0.5px rgba(255,255,255,.05)' }}>

          {/* Sidebar */}
          <div style={{ width:sidebarOpen?160:0, flexShrink:0, overflow:'hidden', borderRight:sidebarOpen?'0.5px solid rgba(255,255,255,.07)':'none', background:'#060606', transition:'width .2s ease', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'12px 10px 8px', borderBottom:'0.5px solid rgba(255,255,255,.06)', flexShrink:0 }}>
              <button onClick={handleNewChat} style={{ width:'100%', background:'rgba(255,255,255,.05)', border:'0.5px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:10.5, letterSpacing:'.07em', textTransform:'uppercase', padding:'6px 0', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.09)';e.currentTarget.style.color='#fff'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.color='rgba(255,255,255,.6)'}}
              >+ New Chat</button>
            </div>
            <div className="cw-scrollbar" style={{ flex:1, overflowY:'auto', padding:'6px 6px' }}>
              {sessions.map(s=><HistoryItem key={s.id} session={s} isActive={s.id===activeId} onSelect={id=>setActiveId(id)} onDelete={handleDeleteSession}/>)}
            </div>
          </div>

          {/* Main area */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

            {/* Header */}
            <div style={{ padding:'11px 14px 10px', borderBottom:'0.5px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:'#000' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <button onClick={()=>setSidebarOpen(o=>!o)} title="Chat history"
                  style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', padding:'2px 4px', display:'flex', alignItems:'center', transition:'color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2.5h12M1 7h12M1 11.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </button>
                <div style={{ width:30, height:30, background:'#fff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9.5, fontWeight:700, color:'#000', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.06em' }}>AP</div>
                <div>
                  <p style={{ margin:0, fontSize:12, fontWeight:500, color:'#fff', fontFamily:"'DM Sans',sans-serif" }}>AP Newsletter AI</p>
                  <p style={{ margin:0, fontSize:8.5, color:'rgba(255,255,255,.2)', letterSpacing:'.12em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif" }}>General + Expert Mode</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px rgba(74,222,128,.5)' }}/>
                  <span style={{ fontSize:8, color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'.12em', fontFamily:"'DM Sans',sans-serif" }}>Live</span>
                </div>
                {/* Clear */}
                <button onClick={handleClearChat} title="Clear chat"
                  style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.2)', fontSize:13, transition:'color .15s', padding:'2px 3px' }}
                  onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.2)'}
                >⊘</button>
                {/* Minimize button */}
                <button onClick={()=>{setOpen(false);setMinimized(true)}} title="Minimize chat"
                  style={{ background:'none', border:'0.5px solid rgba(255,255,255,.12)', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:12, lineHeight:1, padding:'3px 8px', transition:'all .15s', display:'flex', alignItems:'center' }}
                  onMouseEnter={e=>{e.currentTarget.style.color='rgba(255,255,255,.7)';e.currentTarget.style.borderColor='rgba(255,255,255,.3)'}}
                  onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,.3)';e.currentTarget.style.borderColor='rgba(255,255,255,.12)'}}
                >—</button>
              </div>
            </div>

            {/* Messages */}
            <div className="cw-scrollbar" style={{ flex:1, overflowY:'auto', padding:'16px 14px 8px', display:'flex', flexDirection:'column' }}>
              {activeSession.messages.map((msg,i)=><MessageBubble key={msg.id||i} msg={msg}/>)}
              {isEmpty && !loading && (
                <div style={{ marginTop:8, animation:'cwFadeUp .3s ease .1s both' }}>
                  <p style={{ fontSize:8.5, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,.15)', fontFamily:"'DM Sans',sans-serif", marginBottom:8 }}>Try asking</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {SUGGESTIONS.map((s,i)=>(
                      <button key={i} onClick={()=>sendMessage(s.text)}
                        style={{ background:'transparent', border:'0.5px solid rgba(255,255,255,.09)', color:'rgba(255,255,255,.4)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif", fontSize:11.5, padding:'7px 11px', transition:'all .15s', lineHeight:1.4, display:'flex', alignItems:'center', gap:7 }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.color='rgba(255,255,255,.7)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,.4)';e.currentTarget.style.borderColor='rgba(255,255,255,.09)'}}
                      >
                        <span style={{ fontSize:13 }}>{s.icon}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} style={{ height:1 }}/>
            </div>

            {/* Input */}
            <div style={{ padding:'9px 12px 11px', background:'#000', flexShrink:0, borderTop:'0.5px solid rgba(255,255,255,.06)' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, border:'0.5px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.02)', padding:'7px 9px 7px 13px' }}>
                <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading}
                  placeholder={loading?'Thinking…':'Ask anything — general or newsletter…'}
                  rows={1}
                  style={{ flex:1, background:'none', border:'none', outline:'none', resize:'none', color:'rgba(255,255,255,.87)', fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.5, letterSpacing:'.015em', maxHeight:120, minHeight:20, overflowY:'auto', padding:0, caretColor:'#fff' }}
                />
                <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading}
                  style={{ width:32, height:32, flexShrink:0, border:'none', background:input.trim()&&!loading?'#fff':'rgba(255,255,255,.07)', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', borderRadius:2 }}
                  onMouseEnter={e=>{if(input.trim()&&!loading)e.currentTarget.style.transform='scale(1.06)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}
                >
                  {loading
                    ? <><style>{`@keyframes cwSpin{to{transform:rotate(360deg)}}`}</style><div style={{ width:12, height:12, border:'1.5px solid rgba(255,255,255,.15)', borderTop:'1.5px solid rgba(255,255,255,.5)', borderRadius:'50%', animation:'cwSpin .6s linear infinite' }}/></>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 11.5L11.5 6.5L1.5 1.5V5.5L8 6.5L1.5 7.5V11.5Z" fill={input.trim()?'#000':'rgba(255,255,255,.2)'}/></svg>
                  }
                </button>
              </div>
              <p style={{ margin:'5px 0 0', textAlign:'center', fontSize:8.5, color:'rgba(255,255,255,.1)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif" }}>
                Enter · Shift+Enter new line · Esc close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
