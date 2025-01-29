const express = require('express')
const { createExpedition, updateExpedition, deleteExpedition, getExpeditions, getPopularDestinations, getMonthlyBookings, getExpedition } = require('../controllers/expeditionController')
const { isAuthorizeRoles, isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.route('/create').post(isAuthenticated, isAuthorizeRoles('admin'), createExpedition)
router.route('/update/:id').put(isAuthenticated, isAuthorizeRoles('admin'), updateExpedition)
router.route('/delete/:id').delete(isAuthenticated, isAuthorizeRoles('admin'), deleteExpedition)
router.route('/all').get(getExpeditions)
router.route('/:id').get(getExpedition)
router.route('/popular/all').get(getPopularDestinations)
router.route('/monthly/all').get(getMonthlyBookings)

module.exports = router
