const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const app = require('./app')

const connectDatabase = require('./config/database')
const { PORT } = require('./config/constant')
const { connectSocket } = require('./config/socket')

process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`)
  console.log(`Shutting down the server due to Uncaught Exception`)

  throw Error('Server Not Running...');
});

connectDatabase();

let server = connectSocket(app);

server = app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`)
});


process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`)
  console.log(`Shutting down the server due to Unhandled Promis Rejection`)

  server.close(() => {
    throw Error('Server Not Running...')
  })
});


module.exports = app