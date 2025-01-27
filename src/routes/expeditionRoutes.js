const express = require('express')
const { createExpedition, updateExpedition, deleteExpedition, getExpeditions, getPopularDestinations, getMonthlyBookings } = require('../controllers/expeditionController')
const { isAuthorizeRoles, isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.route('/create').post(isAuthenticated, isAuthorizeRoles('admin'), createExpedition)
router.route('/update/:id').put(isAuthenticated, isAuthorizeRoles('admin'), updateExpedition)
router.route('/delete/:id').delete(isAuthenticated, isAuthorizeRoles('admin'), deleteExpedition)
router.route('/all').get(getExpeditions)
router.route('/popular').get(getPopularDestinations)
router.route('/monthly').get(getMonthlyBookings)

module.exports = router
