const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

const {
  subscribe,
  getCount,
  getAllSubscribers,
  removeSubscriber,
  exportCSV,
} = require('../controllers/waitlistController')

const { waitlistLimiter, adminLimiter } = require('../middleware/rateLimiter')
const adminAuth = require('../middleware/adminAuth')

// ✅ ADD THIS ROOT ROUTE (VERY IMPORTANT)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀",
  })
})

// ─── Input validation middleware ───
const validateEmail = [
  body('email')
    .isEmail().withMessage('Please provide a valid email.')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email too long.'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      })
    }
    next()
  },
]

// ─── Public routes ───────────────────────────────────────

// POST /api/waitlist — subscribe
router.post('/waitlist', waitlistLimiter, validateEmail, subscribe)

// GET /api/waitlist/count — get subscriber count
router.get('/waitlist/count', getCount)

// ─── Admin routes (protected) ────────────────────────────

// GET /api/admin/subscribers — list all subscribers
router.get('/admin/subscribers', adminLimiter, adminAuth, getAllSubscribers)

// DELETE /api/admin/subscribers/:email — remove subscriber
router.delete('/admin/subscribers/:email', adminLimiter, adminAuth, removeSubscriber)

// GET /api/admin/export — download CSV
router.get('/admin/export', adminLimiter, adminAuth, exportCSV)

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = router