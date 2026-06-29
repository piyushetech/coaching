const crypto = require('crypto');

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
};

const getOTPExpiry = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

const calculateProfileCompletion = (profile, role) => {
  const fields =
    role === 'parent'
      ? ['fullName', 'phone', 'profilePicture', 'location']
      : [
          'fullName',
          'age',
          'gender',
          'profilePicture',
          'aboutMe',
          'experienceYears',
          'hourlyRate',
          'dailyRate',
          'monthlySalary',
          'location',
          'languages',
          'availability',
        ];

  let filled = 0;
  fields.forEach((field) => {
    const val = profile[field];
    if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
      filled++;
    }
  });

  return Math.round((filled / fields.length) * 100);
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(50, Math.max(1, parseInt(limit, 10)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = {
  generateOTP,
  getOTPExpiry,
  calculateProfileCompletion,
  paginate,
  buildPaginationMeta,
};
