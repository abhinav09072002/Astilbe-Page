require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')
const routes = require('./routes/index')
const chatRoutes = require('./routes/chat')
const authRoutes = require('./routes/auth')
const { generalLimiter } = require('./middleware/rateLimiter')
const { addToVectorStore } = require('./services/vectorStore')
const { seedKnowledge } = require('./data/knowledge')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Connect to MongoDB ───────────────────────────────────
connectDB()

// ─── Security Middleware ──────────────────────────────────
app.use(helmet())
app.use(generalLimiter)

// ─── CORS ────────────────────────────────────────────────
// Builds an allowed-origins list from env + common local dev ports
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://your-app.vercel.app
  'http://localhost:3000',           // Vite dev server
  'http://localhost:5173',           // Vite alt port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean) // removes undefined if FRONTEND_URL not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, same-origin)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin} is not in the allowed list.`))
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret', 'Authorization'],
  credentials: true,
}))

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// ─── Routes ──────────────────────────────────────────────
app.use('/api', routes)
app.use('/api', chatRoutes)
app.use('/api/auth', authRoutes)

// ─── Root ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'AP Newsletter API',
    version: '3.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      signup:      'POST   /api/auth/signup',
      login:       'POST   /api/auth/login',
      me:          'GET    /api/auth/me',
      subscribe:   'POST   /api/waitlist',
      count:       'GET    /api/waitlist/count',
      health:      'GET    /api/health',
      chat:        'POST   /api/chat',
      addKnowledge:'POST   /api/add-data',
      chatHistory: 'GET    /api/history/:sessionId',
      adminList:   'GET    /api/admin/subscribers',
    },
  })
})

// ─── Seed knowledge base 3 seconds after startup ─────────
setTimeout(() => {
  seedKnowledge(addToVectorStore).catch(e => {
    console.log('  ⚠️  Knowledge seeding skipped:', e.message)
  })
}, 3000)

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
})

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  // CORS errors get a clear message
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ success: false, message: err.message })
  }
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  })
})

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('')
  console.log('  ▓▓ AP Newsletter Backend v3.0')
  console.log(`  ✅ Server running on http://localhost:${PORT}`)
  console.log(`  🔐 Auth:     POST /api/auth/signup | /api/auth/login`)
  console.log(`  🤖 AI Chat:  POST /api/chat`)
  console.log(`  📚 Add Data: POST /api/add-data`)
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`  🔗 Allowed origins: ${allowedOrigins.join(', ') || '(none set)'}`)
  console.log('')
})

module.exports = app
