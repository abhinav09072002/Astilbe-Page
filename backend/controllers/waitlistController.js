const Subscriber = require('../models/Subscriber')
const { sendConfirmationEmail } = require('../config/email')

// ─────────────────────────────────────────
// POST /api/waitlist
// Subscribe a new email to the waitlist
// ─────────────────────────────────────────
const subscribe = async (req, res) => {
  try {
    const { email, source = 'waitlist' } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() })

    if (existing) {
      // Already exists — return success silently (don't leak info)
      return res.status(200).json({
        success: true,
        message: 'You\'re already on the waitlist!',
        alreadySubscribed: true,
      })
    }

    // Get subscriber's IP (for analytics, stored but not exposed)
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      null

    // Save to database
    const subscriber = await Subscriber.create({
      email: email.toLowerCase().trim(),
      source,
      status: 'pending',
      ipAddress,
    })

    // Send confirmation email (non-blocking — won't fail the request if email fails)
    const emailSent = await sendConfirmationEmail(subscriber.email)
    if (emailSent) {
      await Subscriber.findByIdAndUpdate(subscriber._id, { emailSent: true, status: 'confirmed' })
    }

    // Get total count for social proof
    const totalCount = await Subscriber.countDocuments({ status: { $in: ['pending', 'confirmed'] } })

    return res.status(201).json({
      success: true,
      message: 'You\'re on the list! Check your email for confirmation.',
      data: {
        email: subscriber.email,
        joinedAt: subscriber.createdAt,
        totalSubscribers: totalCount,
      },
    })
  } catch (error) {
    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You\'re already on the waitlist!',
        alreadySubscribed: true,
      })
    }
    // Validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', '),
      })
    }
    console.error('Subscribe error:', error)
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// ─────────────────────────────────────────
// GET /api/waitlist/count
// Public — returns subscriber count for social proof
// ─────────────────────────────────────────
const getCount = async (req, res) => {
  try {
    const count = await Subscriber.countDocuments({ status: { $in: ['pending', 'confirmed'] } })
    return res.status(200).json({ success: true, count })
  } catch (error) {
    console.error('Count error:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────
// GET /api/admin/subscribers
// Admin only — returns all subscribers
// ─────────────────────────────────────────
const getAllSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const [subscribers, total] = await Promise.all([
      Subscriber.find({})
        .select('-ipAddress') // hide IP from admin response
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscriber.countDocuments(),
    ])

    return res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    })
  } catch (error) {
    console.error('Get subscribers error:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────
// DELETE /api/admin/subscribers/:email
// Admin only — unsubscribe / remove an email
// ─────────────────────────────────────────
const removeSubscriber = async (req, res) => {
  try {
    const { email } = req.params
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: 'unsubscribed' },
      { new: true }
    )
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found.' })
    }
    return res.status(200).json({ success: true, message: `${email} has been unsubscribed.` })
  } catch (error) {
    console.error('Remove subscriber error:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────
// GET /api/admin/export
// Admin only — export all emails as CSV
// ─────────────────────────────────────────
const exportCSV = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ status: { $ne: 'unsubscribed' } })
      .select('email source status createdAt')
      .sort({ createdAt: -1 })

    const csv = [
      'email,source,status,joined_at',
      ...subscribers.map(s =>
        `${s.email},${s.source},${s.status},${s.createdAt.toISOString()}`
      ),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=ap-waitlist.csv')
    return res.status(200).send(csv)
  } catch (error) {
    console.error('Export error:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = { subscribe, getCount, getAllSubscribers, removeSubscriber, exportCSV }
