const express = require('express')
const { registerUser, loginUser, verifyToken } = require('../controllers/userController')

const router = express.Router()

router.route('/signup').post(registerUser)
router.route('/signin').post(loginUser)
router.route('/verify').post(verifyToken)

module.exports = router
