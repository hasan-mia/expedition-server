const { mongoose } = require('mongoose')

const expeditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  destination: {
    type: String, required: true
  },
  startDate: {
    type: Date,
    required: true

  },
  endDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
},
  {
    timeStamp: true,
  })

module.exports = mongoose.model('Expedition', expeditionSchema)
