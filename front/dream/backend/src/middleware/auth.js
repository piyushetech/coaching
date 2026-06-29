const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id, secret, expiresIn) =>
  jwt.sign({ id }, secret, { expiresIn });

const generateTokens = (userId) => {
  const accessToken = signToken(userId, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '15m');
  const refreshToken = signToken(userId, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  return { accessToken, refreshToken };
};

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive || user.isBanned) {
    return next(new AppError('User no longer exists or is banned.', 401));
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { generateTokens, protect, restrictTo };
