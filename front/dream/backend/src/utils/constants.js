const USER_ROLES = {
  PARENT: 'parent',
  NANNY: 'nanny',
  ADMIN: 'admin',
};

const HIRING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const PRICING_TYPES = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  MONTHLY: 'monthly',
};

const NANNY_SKILLS = [
  'cooking',
  'cleaning',
  'infantCare',
  'toddlerCare',
  'specialNeeds',
  'homeworkHelp',
  'petFriendly',
  'nightShift',
  'weekendAvailable',
];

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

module.exports = {
  USER_ROLES,
  HIRING_STATUS,
  PRICING_TYPES,
  NANNY_SKILLS,
  VERIFICATION_STATUS,
};
