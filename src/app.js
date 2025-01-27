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

app.use(cors());
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))


// All Route
app.use(`${API_PREFIX}/`, user)
app.use(`${API_PREFIX}/expedition`, expedition)


// error middleware
app.use(errorMiddleware)

module.exports = app
