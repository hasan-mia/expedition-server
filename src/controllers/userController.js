const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const sendToken = require('../utils/generateJwtToken.js')
const ErrorHandler = require('../utils/errorhandler.js')
const catchAsyncError = require('../middleware/catchAsyncError.js');
const { JWT_SECRET, FRONTEND_URL, SMPT_MAIL } = require('../config/constant.js');
const sendEmail = require('../utils/sendEmail.js');

//Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!password) {
      return next(new ErrorHandler('Please provide a name and password', 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler(`${email} is already registered`, 401));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({ email, password: hashedPassword, role });

    const token = jwt.sign({ id: createdUser._id }, JWT_SECRET, { expiresIn: '15m' });
    const magicLink = `${FRONTEND_URL}/auth/verify?token=${token}`;

    const options = {
      from: `Verify Email <${SMPT_MAIL}>`,
      email,
      subject: 'Please verify email',
      message: magicLink,
    }

    await sendEmail(options)

    res.status(201).json({
      success: true,
      message: 'Verify link sent to email successfully.'
    })

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ErrorHandler('Please Enter Email & Password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler('Invalid Email & Password', 401))
  }

  try {
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler('Invalid Email & Password !', 401))
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
    const magicLink = `${FRONTEND_URL}/auth/verify?token=${token}`;

    const options = {
      from: `Verify Email <${SMPT_MAIL}>`,
      email,
      subject: 'Please verify email',
      message: magicLink,
    }

    await sendEmail(options)

    res.status(200).json({
      success: true,
      message: 'Verify link sent to email successfully.'
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
})

exports.verifyToken = catchAsyncError(async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const responsePayload = {
      id: user._id,
      role: user.role,
    };

    sendToken(responsePayload, 200, res);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
})