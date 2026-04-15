// ─── Chat API Routes ──────────────────────────────────────────────────────────
// POST /api/chat          → main conversation endpoint (dual-mode AI)
// POST /api/add-data      → inject custom knowledge into vector store
// GET  /api/history/:sid  → get session message history
// DELETE /api/history/:sid → clear a session

const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const rateLimit = require('express-rate-limit')

const { detectIntent } = require('../services/intentRouter')
const { generateResponse } = require('../services/huggingface')
const { addToMemory, getMemory, getHistoryText, getSessionTitle, clearMemory } = require('../services/memory')
const { addToVectorStore, searchVectorStore } = require('../services/vectorStore')

// ── Per-IP rate limiting for chat ────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please wait a moment and try again.' },
})

// ─── POST /api/chat ───────────────────────────────────────────────────────────
router.post('/chat', chatLimiter, async (req, res) => {
  const startTime = Date.now()

  try {
    const { message, sessionId: incomingSessionId } = req.body

    // Validate
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message (string) is required.' })
    }
    const trimmed = message.trim()
    if (trimmed.length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' })
    }
    if (trimmed.length > 3000) {
      return res.status(400).json({ success: false, message: 'Message too long (max 3000 chars).' })
    }

    const sessionId = incomingSessionId || uuidv4()

    // 1. Detect intent + mode
    const { intent, isExpertMode } = detectIntent(trimmed)
    console.log(`\n💬 [${sessionId.slice(0,8)}] Intent: ${intent} | Expert: ${isExpertMode}`)
    console.log(`   Message: "${trimmed.slice(0, 80)}${trimmed.length > 80 ? '…' : ''}"`)

    // 2. Get conversation history
    const historyText = getHistoryText(sessionId, 8)

    // 3. RAG: retrieve relevant knowledge (only for expert intents, saves latency on general)
    let ragContext = ''
    if (isExpertMode) {
      try {
        const results = await searchVectorStore(trimmed, 3)
        if (results.length > 0) {
          ragContext = results
            .map(r => r.document)
            .filter(Boolean)
            .join('\n\n---\n\n')
          console.log(`   RAG: found ${results.length} relevant chunks`)
        }
      } catch (e) {
        console.warn('   RAG search failed (non-fatal):', e.message)
      }
    }

    // 4. Generate response
    const reply = await generateResponse({
      message: trimmed,
      intent,
      isExpertMode,
      historyText,
      ragContext,
    })

    // 5. Store exchange in session memory
    addToMemory(sessionId, { role: 'user', content: trimmed })
    addToMemory(sessionId, { role: 'assistant', content: reply })

    // 6. Background: persist exchange to vector store for future RAG
    setImmediate(() => {
      addToVectorStore(
        `Q: ${trimmed}\nA: ${reply.slice(0, 400)}`,
        { sessionId, intent, type: 'exchange' }
      ).catch(() => {})
    })

    const ms = Date.now() - startTime
    console.log(`   ✅ Response in ${ms}ms`)

    return res.json({
      success: true,
      reply,
      sessionId,
      intent,
      isExpertMode,
      responseMs: ms,
      timestamp: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Chat route error:', err)
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again.'
        : `Server error: ${err.message}`,
    })
  }
})

// ─── POST /api/add-data ───────────────────────────────────────────────────────
// Add custom knowledge to the vector store at runtime.
// Great for injecting brand-specific content, FAQs, product details etc.
router.post('/add-data', async (req, res) => {
  try {
    const { content, metadata } = req.body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'content (string) is required.' })
    }
    if (content.length > 20000) {
      return res.status(400).json({ success: false, message: 'Content too long (max 20,000 chars).' })
    }

    const id = await addToVectorStore(content.trim(), {
      source: 'api-injection',
      addedAt: new Date().toISOString(),
      ...metadata,
    })

    return res.json({ success: true, message: 'Knowledge added to vector store.', id })
  } catch (err) {
    console.error('add-data error:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
})

// ─── GET /api/history/:sessionId ─────────────────────────────────────────────
router.get('/history/:sessionId', (req, res) => {
  const history = getMemory(req.params.sessionId)
  const title = getSessionTitle(req.params.sessionId)
  return res.json({
    success: true,
    sessionId: req.params.sessionId,
    title,
    history,
    count: history.length,
  })
})

// ─── DELETE /api/history/:sessionId ──────────────────────────────────────────
router.delete('/history/:sessionId', (req, res) => {
  clearMemory(req.params.sessionId)
  return res.json({ success: true, message: 'Session cleared.' })
})

module.exports = router
