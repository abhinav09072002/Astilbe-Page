require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')
const routes = require('./routes/index')
const chatRoutes = require('./routes/chat')
const authRoutes = require('./routes/auth')

// ✅ FIX: handle ES module export safely
const countModule = require('./routes/count')
const countRoutes = countModule.default || countModule

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
  'https://astilbe-page.netlify.app',
  'https://astilbepage.com', 
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

// ✅ FIXED COUNT ROUTE
app.use('/api/count', countRoutes)
app.get('/api', (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// ─── Root ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'AP Newsletter API',
    version: '3.1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    cors: { allowedOrigins },
    endpoints: {
      signup:       'POST   /api/auth/signup',
      login:        'POST   /api/auth/login',
      me:           'GET    /api/auth/me',
      subscribe:    'POST   /api/waitlist',
      count:        'GET    /api/count',
      health:       'GET    /api/health',
      chat:         'POST   /api/chat',
      addKnowledge: 'POST   /api/add-data',
      chatHistory:  'GET    /api/history/:sessionId',
      adminList:    'GET    /api/admin/subscribers',
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
      fix: `Add FRONTEND_URL=${req.headers.origin} in backend env`,
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
  console.log('')
  console.log('▓▓ AP Newsletter Backend v3.1')
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ') || '(none set)'}`)
  console.log('')
})

module.exports = app