const express = require('express')
const { isAuthorizeRoles, isAuthenticated } = require('../middleware/auth')
const { createBooking, getUserBookings, bookingCancel } = require('../controllers/bookingController')

const router = express.Router()

router.route('/create').post(isAuthenticated, isAuthorizeRoles('user'), createBooking)
router.route('/cancel/:id').put(isAuthenticated, isAuthorizeRoles('user'), bookingCancel)
router.route('/my').get(isAuthenticated, isAuthorizeRoles('user'), getUserBookings)

module.exports = router
