const { mongoose } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { JWT_SECRET } = require('../config/constant')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please Enter your Email'],
    unique: true,
    validate: [validator.isEmail, 'Please Enter a valid Email'],
  },
  password: {
    type: String,
    required: [true, 'Please Enter your Password'],
    minLength: [6, 'Password should have more then 6 characters long'],
    select: false,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user'],
  },
},
  {
    timeStamp: true,
  })

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password') || this.password.startsWith('$2a$')) {
      return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '5d',
  })
}

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')

  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.resetPasswordToken = hashedResetToken

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', userSchema)
