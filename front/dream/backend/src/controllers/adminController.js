const {
  User,
  Parent,
  Nanny,
  HiringRequest,
  Review,
  Report,
  Notification,
  Payment,
} = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginationMeta } = require('../helpers');
const { VERIFICATION_STATUS } = require('../utils/constants');

const getDashboardStats = catchAsync(async (req, res) => {
  const [totalUsers, totalParents, totalNannies, pendingNannies, totalHires, totalReports] =
    await Promise.all([
      User.countDocuments(),
      Parent.countDocuments(),
      Nanny.countDocuments(),
      Nanny.countDocuments({ adminApprovalStatus: VERIFICATION_STATUS.PENDING }),
      HiringRequest.countDocuments({ status: 'confirmed' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

  const monthlyHires = await HiringRequest.countDocuments({
    status: 'confirmed',
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  res.json({
    status: 'success',
    data: {
      totalUsers,
      totalParents,
      totalNannies,
      pendingNannies,
      totalHires,
      monthlyHires,
      pendingReports: totalReports,
    },
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await User.countDocuments(filter);
  res.json({ status: 'success', data: users, pagination: buildPaginationMeta(total, page, limit) });
});

const banUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  user.isBanned = !user.isBanned;
  await user.save();
  res.json({ status: 'success', data: user });
});

const getPendingNannies = catchAsync(async (req, res) => {
  const nannies = await Nanny.find({ adminApprovalStatus: VERIFICATION_STATUS.PENDING })
    .populate('user', 'email createdAt')
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: nannies });
});

const getAllParents = catchAsync(async (req, res) => {
  const parents = await Parent.find()
    .populate('user', 'email createdAt isEmailVerified')
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: parents });
});

const getAllNannies = catchAsync(async (req, res) => {
  const nannies = await Nanny.find()
    .populate('user', 'email createdAt')
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: nannies });
});

const approveNanny = catchAsync(async (req, res, next) => {
  const nanny = await Nanny.findById(req.params.id);
  if (!nanny) return next(new AppError('Nanny not found.', 404));
  nanny.adminApprovalStatus = VERIFICATION_STATUS.APPROVED;
  await nanny.save();
  res.json({ status: 'success', data: nanny });
});

const rejectNanny = catchAsync(async (req, res, next) => {
  const nanny = await Nanny.findById(req.params.id);
  if (!nanny) return next(new AppError('Nanny not found.', 404));
  nanny.adminApprovalStatus = VERIFICATION_STATUS.REJECTED;
  await nanny.save();
  res.json({ status: 'success', data: nanny });
});

const verifyDocument = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { docType, verified } = req.body;
  const nanny = await Nanny.findById(id);
  if (!nanny) return next(new AppError('Nanny not found.', 404));

  if (docType === 'idProof') nanny.documents.idProof.verified = verified;
  else if (docType === 'policeVerification') {
    nanny.documents.policeVerification.verified = verified;
    nanny.policeVerified = verified;
  } else if (docType === 'background') {
    nanny.backgroundVerified = verified;
  }

  await nanny.save();
  res.json({ status: 'success', data: nanny });
});

const getReports = catchAsync(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'email role')
    .populate('reportedUser', 'email role')
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: reports });
});

const resolveReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);
  if (!report) return next(new AppError('Report not found.', 404));
  report.status = req.body.status;
  report.adminNotes = req.body.adminNotes;
  await report.save();
  res.json({ status: 'success', data: report });
});

const getReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('parent', 'fullName')
    .populate('nanny', 'fullName')
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: reviews });
});

const toggleReviewVisibility = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));
  review.isVisible = !review.isVisible;
  await review.save();
  res.json({ status: 'success', data: review });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  banUser,
  getPendingNannies,
  getAllParents,
  getAllNannies,
  approveNanny,
  rejectNanny,
  verifyDocument,
  getReports,
  resolveReport,
  getReviews,
  toggleReviewVisibility,
};
