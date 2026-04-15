const rateLimit = require('express-rate-limit')

// Waitlist signup — max 5 attempts per 15 minutes per IP
const waitlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many signup attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API — max 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Admin routes — max 10 per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many admin requests.',
  },
})

module.exports = { waitlistLimiter, generalLimiter, adminLimiter }
