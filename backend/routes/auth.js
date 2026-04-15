const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')

const { signup, login, getMe, saveIdea, deleteIdea } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Strict limiter for auth endpoints (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes.' },
})

// ─── Public routes ────────────────────────────────────────────────────────────
router.post('/signup', authLimiter, signup)
router.post('/login',  authLimiter, login)

// ─── Protected routes ─────────────────────────────────────────────────────────
router.get('/me',                         protect, getMe)
router.post('/save-idea',                 protect, saveIdea)
router.delete('/save-idea/:id',           protect, deleteIdea)

module.exports = router
