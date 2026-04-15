const mongoose = require('mongoose')
const validator = require('validator')

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email address',
      },
    },
    source: {
      type: String,
      enum: ['hero', 'waitlist', 'api'],
      default: 'waitlist',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'unsubscribed'],
      default: 'pending',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

// Index for fast lookups
subscriberSchema.index({ email: 1 })
subscriberSchema.index({ createdAt: -1 })
subscriberSchema.index({ status: 1 })

const Subscriber = mongoose.model('Subscriber', subscriberSchema)

module.exports = Subscriber
