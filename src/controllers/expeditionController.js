const catchAsyncError = require("../middleware/catchAsyncError");
const expeditionModel = require("../models/expeditionModel");
const { sendLiveMessage } = require("../services/socketServices");
const ErrorHandler = require("../utils/errorhandler");


exports.createExpedition = catchAsyncError(async (req, res, next) => {
    const newData = req.body;
    try {
        const expedition = new expeditionModel(newData);
        await expedition.save();

        sendLiveMessage('expeditionCreated', 'Expedition create successfully', expedition)

        res.status(201).json({
            success: true,
            message: 'Expedition create successfully',
            data: expedition,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateExpedition = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const newData = req.body;
    try {

        const updatedExpedition = await expeditionModel.findByIdAndUpdate(id, newData, { new: true });

        if (!updatedExpedition) {
            return next(new ErrorHandler('Expedition not found', 400))
        }

        sendLiveMessage('updateExpedition', 'Expedition update successfully', updatedExpedition)

        res.status(202).json({
            success: true,
            message: 'Expedition update successfully',
            data: updatedExpedition,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteExpedition = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    try {

        const deletedExpedition = await expeditionModel.findByIdAndDelete(id);

        if (!deletedExpedition) {
            return res.status(404).json({ message: 'Expedition not found' });
        }

        sendLiveMessage('deleteExpedition', 'Expedition deleted successfully', deletedExpedition)

        res.status(200).json({ message: 'Expedition deleted successfully' });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getExpeditions = catchAsyncError(async (req, res, next) => {
    const { keyword, date } = req.query;

    try {
        let perPage;

        // Parse the perPage limit
        if (req.query && typeof req.query.limit === "string") {
            perPage = parseInt(req.query.limit, 10);
            console.log(`Parsed perPage: ${perPage}`);
        }

        const searchCriteria = {};

        if (keyword) {
            searchCriteria.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { price: { $regex: keyword, $options: 'i' } },
            ];
        }

        if (date) {
            let startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            let endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            searchCriteria.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const currentPage = req.query.page ? parseInt(req.query.page, 10) : 1;
        const skip = (currentPage - 1) * (perPage || 10);

        // Aggregation
        const aggregationPipeline = [
            {
                $match: searchCriteria,
            },
            {
                $project: {
                    name: 1,
                    destination: 1,
                    startDate: 1,
                    endDate: 1,
                    price: 1,
                    availableSeats: 1,
                    totalSeats: 1,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: perPage,
            },
        ];

        // Get total count for pagination
        const totalDocuments = await expeditionModel.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalDocuments / (perPage || 10));

        // Execute the aggregation
        const result = await expeditionModel.aggregate(aggregationPipeline);

        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        let nextUrl;

        if (nextPage) {
            nextUrl = `${req.originalUrl.split("?")[0]}?limit=${perPage || 10
                }&page=${nextPage}`;
            if (keyword) {
                nextUrl += `&keyword=${keyword}`;
            }
            if (date) {
                nextUrl += `&date=${date}`;
            }
        }

        res.status(200).json({
            success: true,
            data: result,
            total: totalDocuments,
            perPage: perPage || 10,
            limit: result.length,
            currentPage,
            totalPages,
            nextPage,
            nextUrl,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

});

exports.getPopularDestinations = catchAsyncError(async (_, res, next) => {
    try {
        const result = await expeditionModel.aggregate([
            { $group: { _id: '$destination', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})

exports.getMonthlyBookings = catchAsyncError(async (_, res, next) => {
    try {

        const result = await expeditionModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})