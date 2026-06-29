const { Parent, Nanny, Favorite } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { calculateProfileCompletion } = require('../helpers');

const getParentProfile = catchAsync(async (req, res) => {
  const profile = await Parent.findOne({ user: req.user._id }).populate('favoriteNannies');
  res.json({ status: 'success', data: profile });
});

const updateParentProfile = catchAsync(async (req, res) => {
  const profile = await Parent.findOneAndUpdate({ user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  profile.profileCompletion = calculateProfileCompletion(profile, 'parent');
  await profile.save();
  res.json({ status: 'success', data: profile });
});

const uploadParentPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image.', 400));
  const result = await uploadToCloudinary(req.file.buffer, 'nannyconnect/parents');
  const profile = await Parent.findOneAndUpdate(
    { user: req.user._id },
    { profilePicture: result.secure_url },
    { new: true }
  );
  res.json({ status: 'success', data: profile });
});

const addFavorite = catchAsync(async (req, res, next) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const { nannyId } = req.params;

  const exists = await Favorite.findOne({ parent: parent._id, nanny: nannyId });
  if (exists) return next(new AppError('Already in favorites.', 400));

  await Favorite.create({ parent: parent._id, nanny: nannyId });
  await Parent.findByIdAndUpdate(parent._id, { $addToSet: { favoriteNannies: nannyId } });

  res.status(201).json({ status: 'success', message: 'Added to favorites.' });
});

const removeFavorite = catchAsync(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const { nannyId } = req.params;

  await Favorite.deleteOne({ parent: parent._id, nanny: nannyId });
  await Parent.findByIdAndUpdate(parent._id, { $pull: { favoriteNannies: nannyId } });

  res.json({ status: 'success', message: 'Removed from favorites.' });
});

const getFavorites = catchAsync(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const favorites = await Favorite.find({ parent: parent._id }).populate({
    path: 'nanny',
    populate: { path: 'user', select: 'email isEmailVerified' },
  });
  res.json({ status: 'success', data: favorites });
});

const addRecentlyViewed = catchAsync(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const { nannyId } = req.params;
  await Parent.findByIdAndUpdate(parent._id, {
    $pull: { recentlyViewed: nannyId },
  });
  await Parent.findByIdAndUpdate(parent._id, {
    $push: { recentlyViewed: { $each: [nannyId], $position: 0, $slice: 20 } },
  });
  res.json({ status: 'success' });
});

module.exports = {
  getParentProfile,
  updateParentProfile,
  uploadParentPhoto,
  addFavorite,
  removeFavorite,
  getFavorites,
  addRecentlyViewed,
};
