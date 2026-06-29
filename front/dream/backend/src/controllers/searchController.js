const { Nanny, Parent } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginationMeta } = require('../helpers');
const { VERIFICATION_STATUS } = require('../utils/constants');

const buildSearchQuery = (filters) => {
  const query = { adminApprovalStatus: VERIFICATION_STATUS.APPROVED, 'user.isActive': true };

  if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
  if (filters.country) query['location.country'] = new RegExp(filters.country, 'i');
  if (filters.area) query['location.area'] = new RegExp(filters.area, 'i');
  if (filters.gender) query.gender = filters.gender;
  if (filters.experience) query.experienceYears = { $gte: parseInt(filters.experience, 10) };
  if (filters.rating) query.rating = { $gte: parseFloat(filters.rating) };
  if (filters.age) query.age = { $lte: parseInt(filters.age, 10) };
  if (filters.verifiedOnly === 'true') query.backgroundVerified = true;
  if (filters.liveIn === 'true') query.liveIn = true;
  if (filters.liveOut === 'true') query.liveOut = true;
  if (filters.instantHire === 'true') query.instantHire = true;
  if (filters.featured === 'true') query.isFeatured = true;

  if (filters.pricingType) query.pricingType = filters.pricingType;
  if (filters.minPrice || filters.maxPrice) {
    const priceField =
      filters.pricingType === 'daily'
        ? 'dailyRate'
        : filters.pricingType === 'monthly'
          ? 'monthlySalary'
          : 'hourlyRate';
    query[priceField] = {};
    if (filters.minPrice) query[priceField].$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query[priceField].$lte = parseFloat(filters.maxPrice);
  }

  if (filters.languages) {
    query.languages = { $in: filters.languages.split(',').map((l) => l.trim()) };
  }

  const skillFilters = [
    'cpr',
    'firstAid',
    'specialNeeds',
    'infantCare',
    'nightShift',
    'weekendAvailable',
  ];
  skillFilters.forEach((skill) => {
    if (filters[skill] === 'true') {
      if (skill === 'cpr') query['certifications.cpr'] = true;
      else if (skill === 'firstAid') query['certifications.firstAid'] = true;
      else query[`skills.${skill}`] = true;
    }
  });

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  return query;
};

const searchNannies = catchAsync(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const query = buildSearchQuery(req.query);

  let nannies;
  let total;

  if (req.query.lat && req.query.lng) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const maxDistance = parseInt(req.query.distance, 10) || 50000;

    nannies = await Nanny.find({
      ...query,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    })
      .populate('user', 'email isEmailVerified')
      .skip(skip)
      .limit(limit);

    total = await Nanny.countDocuments({
      ...query,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    });
  } else {
    nannies = await Nanny.find(query)
      .populate('user', 'email isEmailVerified')
      .sort({ isFeatured: -1, rating: -1 })
      .skip(skip)
      .limit(limit);
    total = await Nanny.countDocuments(query);
  }

  res.json({
    status: 'success',
    data: nannies,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const getNannyById = catchAsync(async (req, res, next) => {
  const nanny = await Nanny.findById(req.params.id).populate('user', 'email isEmailVerified');
  if (!nanny) {
    const err = require('../utils/AppError');
    return next(new err('Nanny not found.', 404));
  }
  res.json({ status: 'success', data: nanny });
});

const getRecommendations = catchAsync(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });
  const query = {
    adminApprovalStatus: VERIFICATION_STATUS.APPROVED,
    rating: { $gte: 4 },
  };

  if (parent?.location?.coordinates?.coordinates?.[0]) {
    const [lng, lat] = parent.location.coordinates.coordinates;
    const nannies = await Nanny.find({
      ...query,
      'location.coordinates': {
        $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: 30000 },
      },
    })
      .limit(10)
      .populate('user', 'email');
    return res.json({ status: 'success', data: nannies });
  }

  const nannies = await Nanny.find(query).sort({ rating: -1 }).limit(10);
  res.json({ status: 'success', data: nannies });
});

module.exports = { searchNannies, getNannyById, getRecommendations };
