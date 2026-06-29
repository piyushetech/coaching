const { Notification, Report } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginationMeta } = require('../helpers');

const getNotifications = catchAsync(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Notification.countDocuments({ user: req.user._id });
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.json({
    status: 'success',
    data: notifications,
    unreadCount,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return next(new AppError('Notification not found.', 404));
  notification.isRead = true;
  await notification.save();
  res.json({ status: 'success', data: notification });
});

const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ status: 'success', message: 'All notifications marked as read.' });
});

const reportUser = catchAsync(async (req, res, next) => {
  const { reportedUserId, reason, description } = req.body;
  if (reportedUserId === req.user._id.toString()) {
    return next(new AppError('Cannot report yourself.', 400));
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: reportedUserId,
    reason,
    description,
  });

  res.status(201).json({ status: 'success', data: report });
});

module.exports = { getNotifications, markAsRead, markAllRead, reportUser };
