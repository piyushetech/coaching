const { User, Parent, Nanny } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateTokens } = require('../middleware/auth');
const { sendOTPEmail } = require('../services/emailService');
const { generateOTP, getOTPExpiry } = require('../helpers');
const { USER_ROLES } = require('../utils/constants');

const register = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    role,
    fullName,
    phone,
    address,
    city,
    budget,
    experienceYears,
    aboutMe,
  } = req.body;

  if (!Object.values(USER_ROLES).includes(role) || role === USER_ROLES.ADMIN) {
    return next(new AppError('Invalid role.', 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('Email already registered.', 400));

  const otp = generateOTP();
  const user = await User.create({
    email,
    password,
    role,
    emailVerificationOTP: otp,
    emailVerificationExpires: getOTPExpiry(),
  });

  const location = address || city ? { address, city } : undefined;

  let profile;
  if (role === USER_ROLES.PARENT) {
    profile = await Parent.create({
      user: user._id,
      fullName,
      phone,
      budget: budget != null && budget !== '' ? Number(budget) : undefined,
      location,
    });
  } else {
    profile = await Nanny.create({
      user: user._id,
      fullName,
      phone,
      aboutMe,
      experienceYears: experienceYears != null && experienceYears !== '' ? Number(experienceYears) : 0,
      location,
    });
  }

  user.profileRef = profile._id;
  await user.save();

  await sendOTPEmail(email, otp, 'verification');

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please verify your email.',
    data: { user, profile, ...tokens },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.isBanned) return next(new AppError('Your account has been banned.', 403));

  user.lastLogin = new Date();
  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  let profile;
  if (user.role === USER_ROLES.PARENT) {
    profile = await Parent.findOne({ user: user._id });
  } else if (user.role === USER_ROLES.NANNY) {
    profile = await Nanny.findOne({ user: user._id });
  }

  res.json({
    status: 'success',
    data: { user, profile, ...tokens },
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    emailVerificationOTP: otp,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired OTP.', 400));

  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ status: 'success', message: 'Email verified successfully.' });
});

const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError('User not found.', 404));
  if (user.isEmailVerified) return next(new AppError('Email already verified.', 400));

  const otp = generateOTP();
  user.emailVerificationOTP = otp;
  user.emailVerificationExpires = getOTPExpiry();
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail(email, otp, 'verification');

  res.json({ status: 'success', message: 'OTP sent to your email.' });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError('User not found.', 404));

  const otp = generateOTP();
  user.passwordResetOTP = otp;
  user.passwordResetExpires = getOTPExpiry();
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail(email, otp, 'reset');

  res.json({ status: 'success', message: 'Password reset OTP sent to your email.' });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    passwordResetOTP: otp,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) return next(new AppError('Invalid or expired OTP.', 400));

  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ status: 'success', message: 'Password reset successfully.' });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  if (!token) return next(new AppError('Refresh token required.', 400));

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    return next(new AppError('Invalid refresh token.', 401));
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({ status: 'success', data: tokens });
});

const logout = catchAsync(async (req, res) => {
  req.user.refreshToken = undefined;
  req.user.fcmToken = undefined;
  await req.user.save({ validateBeforeSave: false });
  res.json({ status: 'success', message: 'Logged out successfully.' });
});

const updateFCMToken = catchAsync(async (req, res) => {
  req.user.fcmToken = req.body.fcmToken;
  await req.user.save({ validateBeforeSave: false });
  res.json({ status: 'success', message: 'FCM token updated.' });
});

module.exports = {
  register,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  updateFCMToken,
};
