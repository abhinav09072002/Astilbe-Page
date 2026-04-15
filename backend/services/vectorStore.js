// ─── Vector Store (RAG) ───────────────────────────────────────────────────────
// Primary:  ChromaDB (requires `chroma run` on localhost:8000)
// Fallback: TF-IDF inspired keyword search (always available, no setup)
//
// Both modes are fully transparent to the rest of the app.

let chromaClient = null
let collection = null
let chromaReady = false

// ── In-memory fallback store ──────────────────────────────────────────────────
const memStore = []
const MAX_MEM_DOCS = 2000

async function initChroma() {
  try {
    const { ChromaClient } = require('chromadb')
    chromaClient = new ChromaClient({ path: 'http://localhost:8000' })
    // Verify connection
    await chromaClient.heartbeat()
    collection = await chromaClient.getOrCreateCollection({
      name: 'ap_newsletter_knowledge',
      metadata: { description: 'AP Newsletter AI knowledge base' },
    })
    chromaReady = true
    console.log('  ✅ ChromaDB connected and ready')
  } catch {
    chromaReady = false
    console.log('  ℹ️  ChromaDB not available — using built-in keyword search (fully functional)')
    console.log('     To enable ChromaDB: pip install chromadb && chroma run')
  }
}

initChroma().catch(() => {})

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a document to the vector store.
 */
async function addToVectorStore(content, metadata = {}) {
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  if (chromaReady && collection) {
    try {
      await collection.add({
        ids: [id],
        documents: [content],
        metadatas: [{ ...metadata, addedAt: new Date().toISOString() }],
      })
      return id
    } catch (e) {
      console.error('ChromaDB add error:', e.message)
    }
  }

  // Fallback
  memStore.push({ id, content, metadata, ts: Date.now() })
  if (memStore.length > MAX_MEM_DOCS) memStore.shift()
  return id
}

/**
 * Search for documents most relevant to a query.
 *
 * Uses ChromaDB semantic search when available,
 * otherwise TF-IDF-inspired keyword scoring.
 *
 * @param {string} query
 * @param {number} nResults
 * @returns {Array<{document: string, metadata: object, score: number}>}
 */
async function searchVectorStore(query, nResults = 3) {
  if (chromaReady && collection) {
    try {
      const results = await collection.query({
        queryTexts: [query],
        nResults: Math.min(nResults, 20),
      })
      if (!results.documents?.[0]?.length) return []
      return results.documents[0].map((doc, i) => ({
        document: doc,
        metadata: results.metadatas?.[0]?.[i] || {},
        score: 1 - (results.distances?.[0]?.[i] ?? 1),
      })).filter(r => r.score > 0.25)
    } catch (e) {
      console.error('ChromaDB query error:', e.message)
    }
  }

  if (memStore.length === 0) return []

  // TF-IDF-inspired keyword scoring
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const idf = computeIDF(queryTokens, memStore)

  const scored = memStore.map(item => {
    const docTokens = tokenize(item.content)
    const docFreq = {}
    docTokens.forEach(t => { docFreq[t] = (docFreq[t] || 0) + 1 })

    let score = 0
    for (const token of queryTokens) {
      const tf = (docFreq[token] || 0) / Math.max(docTokens.length, 1)
      score += tf * (idf[token] || 0)
    }
    return { document: item.content, metadata: item.metadata, score }
  })

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, nResults)
}

/** Tokenize text into lowercase words (3+ chars) */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
}

/** Compute IDF scores for query tokens across corpus */
function computeIDF(tokens, corpus) {
  const idf = {}
  const N = corpus.length || 1
  for (const token of tokens) {
    const df = corpus.filter(d => d.content.toLowerCase().includes(token)).length
    idf[token] = Math.log((N + 1) / (df + 1)) + 1
  }
  return idf
}

module.exports = { addToVectorStore, searchVectorStore }
