// Simple secret-key auth for admin routes
const adminAuth = (req, res, next) => {
  // Guard: if ADMIN_SECRET isn't configured, block all admin access
  if (!process.env.ADMIN_SECRET) {
    console.error('⚠️  ADMIN_SECRET is not set in .env — admin routes are disabled.')
    return res.status(503).json({
      success: false,
      message: 'Admin routes are not configured. Set ADMIN_SECRET in backend/.env.',
    })
  }

  const secret = req.headers['x-admin-secret'] || req.query.secret

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or missing admin secret.',
    })
  }

  next()
}

module.exports = adminAuth
