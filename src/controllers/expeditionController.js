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
    const { keyword, date, minPrice, maxPrice } = req.query;

    try {
        const perPage = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const currentPage = Math.max(1, parseInt(req.query.page, 10) || 1);
        const skip = (currentPage - 1) * perPage;

        const searchCriteria = {};

        if (keyword) {
            const sanitizedKeyword = keyword.toString().trim();
            if (sanitizedKeyword) {
                searchCriteria.$or = [
                    { name: { $regex: sanitizedKeyword, $options: 'i' } },
                    { destination: { $regex: sanitizedKeyword, $options: 'i' } },
                    { description: { $regex: sanitizedKeyword, $options: 'i' } }
                ];
            }
        }

        if (date) {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                const startOfDay = new Date(parsedDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(parsedDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                searchCriteria.createdAt = {
                    $gte: startOfDay,
                    $lte: endOfDay
                };
            }
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            searchCriteria.price = {};

            if (minPrice !== undefined) {
                const parsedMinPrice = parseFloat(minPrice);
                if (!isNaN(parsedMinPrice)) {
                    searchCriteria.price.$gte = parsedMinPrice;
                }
            }

            if (maxPrice !== undefined) {
                const parsedMaxPrice = parseFloat(maxPrice);
                if (!isNaN(parsedMaxPrice)) {
                    searchCriteria.price.$lte = parsedMaxPrice;
                }
            }

            if (Object.keys(searchCriteria.price).length === 0) {
                delete searchCriteria.price;
            }
        }

        const aggregationPipeline = [
            {
                $match: searchCriteria,
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
            {
                $project: {
                    name: 1,
                    destination: 1,
                    startDate: 1,
                    endDate: 1,
                    price: 1,
                    availableSeats: 1,
                    totalSeats: 1,
                    createdAt: 1,
                    _id: 1
                },
            },
        ];

        const [totalDocuments, result] = await Promise.all([
            expeditionModel.countDocuments(searchCriteria),
            expeditionModel.aggregate(aggregationPipeline)
        ]);

        const totalPages = Math.ceil(totalDocuments / perPage);
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;

        let nextUrl = null;
        if (nextPage) {
            const baseUrl = req.originalUrl.split("?")[0];
            const queryParams = new URLSearchParams({
                limit: perPage.toString(),
                page: nextPage.toString()
            });

            if (keyword) queryParams.append('keyword', keyword.toString());
            if (date) queryParams.append('date', date.toString());
            if (minPrice !== undefined) queryParams.append('minPrice', minPrice.toString());
            if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice.toString());

            nextUrl = `${baseUrl}?${queryParams.toString()}`;
        }

        res.status(200).json({
            success: true,
            data: result,
            pagination: {
                total: totalDocuments,
                perPage,
                currentPage,
                totalPages,
                nextPage,
                nextUrl,
            },
            filters: {
                keyword: keyword || null,
                date: date || null,
                priceRange: {
                    min: minPrice ? parseFloat(minPrice) : null,
                    max: maxPrice ? parseFloat(maxPrice) : null
                }
            }
        });

    } catch (error) {
        return next(new ErrorHandler(
            error.message || 'Error fetching expeditions',
            error.status || 500
        ));
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