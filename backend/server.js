require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')
const routes = require('./routes/index')
const chatRoutes = require('./routes/chat')
const authRoutes = require('./routes/auth')
const countRoutes = require('./routes/count')   // ✅ FIXED IMPORT
const { generalLimiter } = require('./middleware/rateLimiter')
const { addToVectorStore } = require('./services/vectorStore')
const { seedKnowledge } = require('./data/knowledge')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Connect to MongoDB ───────────────────────────────────────
connectDB()

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet())
app.use(generalLimiter)

// ─── CORS ─────────────────────────────────────────────────────
const rawOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const allowedOrigins = [
  ...rawOrigins,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]

console.log('🔗 Allowed CORS Origins:', allowedOrigins)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked: ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  credentials: true,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', routes)
app.use('/api', chatRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/count', countRoutes)   // ✅ ADD THIS LINE

// ─── Root ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'AP Newsletter API',
    version: '3.1.0',
    status: 'running',
    endpoints: {
      count: 'GET /api/count',   // ✅ updated
    },
  })
})

// ─── Seed knowledge base ─────────────────────────────────────
setTimeout(() => {
  seedKnowledge(addToVectorStore).catch(e => {
    console.log('⚠️  Knowledge seeding skipped:', e.message)
  })
}, 3000)

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  })
})

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    })
  }

  console.error('Unhandled error:', err)

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
  })
})

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

module.exports = app