const { HiringRequest, Parent, Nanny, Chat } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendPushNotification } = require('../services/notificationService');
const { HIRING_STATUS } = require('../utils/constants');
const { paginate, buildPaginationMeta } = require('../helpers');

const createHiringRequest = catchAsync(async (req, res, next) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const { nannyId, message, pricingType, agreedRate, startDate, endDate, schedule } = req.body;

  const nanny = await Nanny.findById(nannyId).populate('user');
  if (!nanny) return next(new AppError('Nanny not found.', 404));

  const existing = await HiringRequest.findOne({
    parent: parent._id,
    nanny: nannyId,
    status: { $in: [HIRING_STATUS.PENDING, HIRING_STATUS.ACCEPTED, HIRING_STATUS.CONFIRMED] },
  });
  if (existing) return next(new AppError('Active hiring request already exists.', 400));

  const request = await HiringRequest.create({
    parent: parent._id,
    nanny: nannyId,
    message,
    pricingType: pricingType || nanny.pricingType,
    agreedRate,
    startDate,
    endDate,
    schedule,
  });

  await sendPushNotification(
    nanny.user,
    'New Hiring Request',
    `You have a new hiring request from ${parent.fullName}`,
    { type: 'hiring_request', requestId: request._id.toString() }
  );

  res.status(201).json({ status: 'success', data: request });
});

const respondToRequest = catchAsync(async (req, res, next) => {
  const nanny = await Nanny.findOne({ user: req.user._id });
  const { requestId } = req.params;
  const { action } = req.body;

  const request = await HiringRequest.findOne({ _id: requestId, nanny: nanny._id }).populate({
    path: 'parent',
    populate: { path: 'user' },
  });

  if (!request) return next(new AppError('Request not found.', 404));
  if (request.status !== HIRING_STATUS.PENDING) {
    return next(new AppError('Request already processed.', 400));
  }

  if (action === 'accept') {
    request.status = HIRING_STATUS.ACCEPTED;
    request.chatEnabled = true;

    await Chat.findOneAndUpdate(
      { participants: { $all: [req.user._id, request.parent.user._id] } },
      {
        participants: [req.user._id, request.parent.user._id],
        hiringRequest: request._id,
      },
      { upsert: true, new: true }
    );
  } else {
    request.status = HIRING_STATUS.REJECTED;
  }

  await request.save();

  await sendPushNotification(
    request.parent.user,
    action === 'accept' ? 'Request Accepted' : 'Request Rejected',
    `Your hiring request was ${action === 'accept' ? 'accepted' : 'rejected'}.`,
    { type: action === 'accept' ? 'hiring_accepted' : 'hiring_rejected' }
  );

  res.json({ status: 'success', data: request });
});

const scheduleInterview = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const request = await HiringRequest.findById(requestId).populate('parent nanny');
  if (!request) return next(new AppError('Request not found.', 404));

  request.interview = req.body;
  request.status = HIRING_STATUS.INTERVIEW_SCHEDULED;
  await request.save();

  res.json({ status: 'success', data: request });
});

const confirmHire = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const request = await HiringRequest.findById(requestId);
  if (!request) return next(new AppError('Request not found.', 404));

  request.status = HIRING_STATUS.CONFIRMED;
  await request.save();
  res.json({ status: 'success', data: request });
});

const completeJob = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const request = await HiringRequest.findById(requestId);
  if (!request) return next(new AppError('Request not found.', 404));

  request.status = HIRING_STATUS.COMPLETED;
  request.completedAt = new Date();
  await request.save();

  await Nanny.findByIdAndUpdate(request.nanny, { $inc: { completedJobs: 1 } });
  res.json({ status: 'success', data: request });
});

const cancelRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const request = await HiringRequest.findById(requestId);
  if (!request) return next(new AppError('Request not found.', 404));

  request.status = HIRING_STATUS.CANCELLED;
  request.cancelledBy = req.user._id;
  request.cancellationReason = req.body.reason;
  await request.save();

  res.json({ status: 'success', data: request });
});

const getMyRequests = catchAsync(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  let filter = {};

  if (req.user.role === 'parent') {
    const parent = await Parent.findOne({ user: req.user._id });
    filter.parent = parent._id;
  } else {
    const nanny = await Nanny.findOne({ user: req.user._id });
    filter.nanny = nanny._id;
  }

  if (req.query.status) filter.status = req.query.status;

  const requests = await HiringRequest.find(filter)
    .populate('parent', 'fullName profilePicture')
    .populate('nanny', 'fullName profilePicture hourlyRate dailyRate monthlySalary pricingType rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await HiringRequest.countDocuments(filter);
  res.json({ status: 'success', data: requests, pagination: buildPaginationMeta(total, page, limit) });
});

module.exports = {
  createHiringRequest,
  respondToRequest,
  scheduleInterview,
  confirmHire,
  completeJob,
  cancelRequest,
  getMyRequests,
};
