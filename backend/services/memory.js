// ─── Conversation Memory Service ─────────────────────────────────────────────
// In-memory session store with smart history formatting for LLM context.
// For production: swap the Map for Redis (drop-in replacement).

const sessions = new Map()
const MAX_MESSAGES_PER_SESSION = 50   // ~25 back-and-forth exchanges
const MAX_HISTORY_CHARS = 3000        // prevent context overflow

/**
 * Add a message to a session.
 * @param {string} sessionId
 * @param {{ role: 'user'|'assistant', content: string }} message
 */
function addToMemory(sessionId, message) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], createdAt: Date.now(), lastActivity: Date.now() })
  }
  const session = sessions.get(sessionId)
  session.messages.push({ ...message, timestamp: new Date().toISOString() })
  session.lastActivity = Date.now()

  // Trim oldest messages while keeping pairs (user + assistant together)
  while (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages.splice(0, 2) // remove oldest user+assistant pair
  }
}

/**
 * Get all messages for a session.
 */
function getMemory(sessionId) {
  return sessions.get(sessionId)?.messages || []
}

/**
 * Get recent conversation history as formatted text for LLM.
 * Smart truncation to prevent context overflow.
 *
 * @param {string} sessionId
 * @param {number} lastN - Number of most recent messages to include
 */
function getHistoryText(sessionId, lastN = 8) {
  const messages = getMemory(sessionId)
  if (messages.length === 0) return ''

  const recent = messages.slice(-lastN)
  let text = recent
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')

  // Truncate from the front if too long
  if (text.length > MAX_HISTORY_CHARS) {
    text = '...(earlier messages)\n' + text.slice(text.length - MAX_HISTORY_CHARS)
  }

  return text
}

/**
 * Get a auto-generated title for a session (from first user message).
 */
function getSessionTitle(sessionId) {
  const messages = getMemory(sessionId)
  const firstUser = messages.find(m => m.role === 'user')
  if (!firstUser) return 'New Chat'
  return firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? '…' : '')
}

/**
 * Clear a session.
 */
function clearMemory(sessionId) {
  sessions.delete(sessionId)
}

/**
 * Cleanup sessions older than 24 hours (prevents memory leak in long-running servers).
 */
function pruneOldSessions() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  for (const [id, session] of sessions.entries()) {
    if (session.lastActivity < cutoff) sessions.delete(id)
  }
}

// Auto-prune every 6 hours
setInterval(pruneOldSessions, 6 * 60 * 60 * 1000)

module.exports = { addToMemory, getMemory, getHistoryText, getSessionTitle, clearMemory }
