const User = require('../models/User')
const { generateToken } = require('../middleware/authMiddleware')

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
async function signup(req, res) {
  try {
    const { name, email, password } = req.body

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.trim().toLowerCase() })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    // Create user — password hashing handled by pre-save hook in model
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    })

    const token = generateToken(user._id)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    console.error('Signup error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use.' })
    }
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Signup failed.' : err.message,
    })
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    // Find user and explicitly include password (select: false in schema)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Login failed.' : err.message,
    })
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns current user from token (used by frontend to restore session)
async function getMe(req, res) {
  try {
    // req.user attached by protect middleware
    return res.json({ success: true, user: req.user.toSafeObject() })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── POST /api/auth/save-idea ─────────────────────────────────────────────────
async function saveIdea(req, res) {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ success: false, message: 'Idea text is required.' })

    const user = await User.findById(req.user._id)
    user.savedIdeas.unshift({ text: text.trim() })
    // Keep max 50 saved ideas
    if (user.savedIdeas.length > 50) user.savedIdeas = user.savedIdeas.slice(0, 50)
    await user.save()

    return res.json({ success: true, message: 'Idea saved!', savedIdeas: user.savedIdeas })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── DELETE /api/auth/save-idea/:id ──────────────────────────────────────────
async function deleteIdea(req, res) {
  try {
    const user = await User.findById(req.user._id)
    user.savedIdeas = user.savedIdeas.filter(i => i._id.toString() !== req.params.id)
    await user.save()
    return res.json({ success: true, message: 'Idea removed.', savedIdeas: user.savedIdeas })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { signup, login, getMe, saveIdea, deleteIdea }
