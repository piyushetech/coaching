const { Nanny } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { calculateProfileCompletion } = require('../helpers');

const getNannyProfile = catchAsync(async (req, res, next) => {
  const profile = await Nanny.findOne({ user: req.user._id });
  if (!profile) return next(new AppError('Profile not found.', 404));
  res.json({ status: 'success', data: profile });
});

const updateNannyProfile = catchAsync(async (req, res) => {
  const profile = await Nanny.findOneAndUpdate({ user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  profile.profileCompletion = calculateProfileCompletion(profile, 'nanny');
  await profile.save();
  res.json({ status: 'success', data: profile });
});

const uploadProfilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image.', 400));
  const result = await uploadToCloudinary(req.file.buffer, 'nannyconnect/nannies/photos');
  const profile = await Nanny.findOneAndUpdate(
    { user: req.user._id },
    { profilePicture: result.secure_url },
    { new: true }
  );
  res.json({ status: 'success', data: profile });
});

const uploadDocument = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a file.', 400));
  const { docType } = req.body;
  const validTypes = ['idProof', 'policeVerification', 'resume'];
  if (!validTypes.includes(docType)) return next(new AppError('Invalid document type.', 400));

  const result = await uploadToCloudinary(req.file.buffer, `nannyconnect/nannies/${docType}`);
  const update = {};
  if (docType === 'resume') {
    update['documents.resume'] = { url: result.secure_url };
  } else {
    update[`documents.${docType}`] = { url: result.secure_url, verified: false };
  }

  const profile = await Nanny.findOneAndUpdate({ user: req.user._id }, update, { new: true });
  res.json({ status: 'success', data: profile });
});

const uploadCertificate = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a certificate.', 400));
  const { title } = req.body;
  const result = await uploadToCloudinary(req.file.buffer, 'nannyconnect/nannies/certificates');
  const profile = await Nanny.findOneAndUpdate(
    { user: req.user._id },
    { $push: { certificates: { title, url: result.secure_url } } },
    { new: true }
  );
  res.json({ status: 'success', data: profile });
});

const uploadGalleryImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image.', 400));
  const result = await uploadToCloudinary(req.file.buffer, 'nannyconnect/nannies/gallery');
  const profile = await Nanny.findOneAndUpdate(
    { user: req.user._id },
    { $push: { gallery: result.secure_url } },
    { new: true }
  );
  res.json({ status: 'success', data: profile });
});

const updateAvailability = catchAsync(async (req, res) => {
  const { availability } = req.body;
  const profile = await Nanny.findOneAndUpdate(
    { user: req.user._id },
    { availability },
    { new: true }
  );
  res.json({ status: 'success', data: profile });
});

const updateOnlineStatus = catchAsync(async (req, res) => {
  const { isOnline } = req.body;
  await Nanny.findOneAndUpdate(
    { user: req.user._id },
    { isOnline, lastSeen: new Date() }
  );
  res.json({ status: 'success', message: 'Status updated.' });
});

module.exports = {
  getNannyProfile,
  updateNannyProfile,
  uploadProfilePhoto,
  uploadDocument,
  uploadCertificate,
  uploadGalleryImage,
  updateAvailability,
  updateOnlineStatus,
};
