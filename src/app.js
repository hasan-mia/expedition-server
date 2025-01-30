const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const errorMiddleware = require('./middleware/error')
const { API_PREFIX } = require('./config/constant.js')

// All route
const user = require('./routes/userRoutes')
const expedition = require('./routes/expeditionRoutes')
const booking = require('./routes/bookingRoutes')

app.use(cors());
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))

app.get('/', async (_, res) => {
    res.send(`<p style='text-align:center; color: green; font-weight:800; font-size: 32px;'>Server is running</p>`)
})

// All Route
app.use(`${API_PREFIX}/`, user)
app.use(`${API_PREFIX}/expedition`, expedition)
app.use(`${API_PREFIX}/booking`, booking)


// error middleware
app.use(errorMiddleware)

module.exports = app
