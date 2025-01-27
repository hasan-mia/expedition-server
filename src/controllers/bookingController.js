const catchAsyncError = require("../middleware/catchAsyncError");
const bookingModel = require("../models/bookingModel");
const expeditionModel = require("../models/expeditionModel");
const { sendLiveMessage } = require("../services/socketServices");
const ErrorHandler = require("../utils/errorhandler");


exports.createBooking = catchAsyncError(async (req, res, next) => {
    const { expeditionId } = req.body
    const userId = req.user.id
    try {

        const expedition = await expeditionModel.findOne({ _id: expeditionId })
        if (!expedition) {
            return res.status(404).json({ message: "Expedition not found" })
        }

        if (expedition.availableSeats <= 0) {
            return res.status(400).json({ message: "No available seats for this expedition" })
        }

        const booking = new bookingModel({
            user: userId,
            expedition: expeditionId,
            status: "confirmed",
        })

        await booking.save()

        expedition.availableSeats -= 1

        await expedition.save()

        sendLiveMessage('createBooking', 'Booking create successfully', booking)

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getUserBookings = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;

    try {
        const perPage = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const currentPage = req.query.page ? parseInt(req.query.page, 10) : 1;
        const skip = (currentPage - 1) * perPage;

        const totalDocuments = await bookingModel.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalDocuments / perPage);

        const bookings = await bookingModel
            .find({ user: userId })
            .populate("expedition")
            .populate("user")
            .skip(skip)
            .limit(perPage);

        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        let nextUrl = null;

        if (nextPage) {
            nextUrl = `${req.originalUrl.split("?")[0]}?limit=${perPage}&page=${nextPage}`;
        }

        res.status(200).json({
            success: true,
            data: bookings,
            total: totalDocuments,
            perPage,
            currentPage,
            totalPages,
            nextPage,
            nextUrl,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.bookingCancel = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id
    try {

        const booking = await bookingModel.findOne({ _id: id, user: userId })

        if (!booking) {
            return next(new ErrorHandler('Booking not found', 404))
        }

        if (booking.status === "cancelled") {
            return next(new ErrorHandler('Booking is already cancelled', 400));
        }

        booking.status = "cancelled"

        await booking.save()

        const expedition = await expeditionModel.findOne({ _id: booking.expedition })
        if (expedition) {
            expedition.availableSeats += 1
            await expedition.save()
            sendLiveMessage('bookingCancel', 'Booking cancel successfully', booking)
        }

        res.status(200).json({ message: "Booking cancelled successfully" })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})