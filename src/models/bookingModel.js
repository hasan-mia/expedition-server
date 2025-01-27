const { mongoose } = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expedition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expedition",
    required: true
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "pending"],
    default: "pending"
  },
},
  {
    timeStamp: true,
  })

module.exports = mongoose.model('Booking', bookingSchema)
