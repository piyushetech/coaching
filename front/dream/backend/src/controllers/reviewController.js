const { Review, Nanny } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Parent } = require('../models');
const { paginate, buildPaginationMeta } = require('../helpers');

const createReview = catchAsync(async (req, res, next) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const { nannyId, rating, comment, hiringRequestId } = req.body;

  const existing = await Review.findOne({ parent: parent._id, nanny: nannyId, hiringRequest: hiringRequestId });
  if (existing) return next(new AppError('Review already submitted.', 400));

  const review = await Review.create({
    parent: parent._id,
    nanny: nannyId,
    hiringRequest: hiringRequestId,
    rating,
    comment,
  });

  const reviews = await Review.find({ nanny: nannyId, isVisible: true });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Nanny.findByIdAndUpdate(nannyId, { rating: avgRating, reviewCount: reviews.length });

  res.status(201).json({ status: 'success', data: review });
});

const getNannyReviews = catchAsync(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const reviews = await Review.find({ nanny: req.params.nannyId, isVisible: true })
    .populate('parent', 'fullName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ nanny: req.params.nannyId, isVisible: true });
  res.json({ status: 'success', data: reviews, pagination: buildPaginationMeta(total, page, limit) });
});

module.exports = { createReview, getNannyReviews };
