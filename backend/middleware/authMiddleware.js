const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ─── Protect middleware ───────────────────────────────────────────────────────
// Verifies Bearer JWT token and attaches req.user
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' })
      }
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in.' })
    }

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ success: false, message: 'Authentication error.' })
  }
}

// ─── Generate JWT token ───────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

module.exports = { protect, generateToken }
