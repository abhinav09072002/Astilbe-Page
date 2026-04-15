const mongoose = require('mongoose')

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in your .env file.')
    console.error('   Copy backend/.env.example to backend/.env and fill in your MongoDB URI.')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    console.error('   Check your MONGODB_URI and ensure your IP is whitelisted in Atlas.')
    process.exit(1)
  }
}

// Log if connection drops after startup
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — attempting to reconnect...')
})
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected')
})

module.exports = connectDB
