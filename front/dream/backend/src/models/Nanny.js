const mongoose = require('mongoose');
const { PRICING_TYPES, VERIFICATION_STATUS } = require('../utils/constants');

const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  area: String,
  zipCode: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
});

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
  startTime: String,
  endTime: String,
  isAvailable: { type: Boolean, default: true },
});

const nannySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, min: 18, max: 70 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: String,
    profilePicture: String,
    videoIntroduction: String,
    aboutMe: { type: String, maxlength: 2000 },

    experienceYears: { type: Number, default: 0, min: 0 },
    education: [{ degree: String, institution: String, year: Number }],
    languages: [{ type: String }],

    // Pricing: hourly, daily, or monthly
    pricingType: {
      type: String,
      enum: Object.values(PRICING_TYPES),
      default: PRICING_TYPES.HOURLY,
    },
    hourlyRate: { type: Number, min: 0 },
    dailyRate: { type: Number, min: 0 },
    monthlySalary: { type: Number, min: 0 },

    liveIn: { type: Boolean, default: false },
    liveOut: { type: Boolean, default: true },
    preferredCities: [String],
    location: locationSchema,
    availability: [availabilitySchema],
    workingHours: { start: String, end: String },

    skills: {
      cooking: { type: Boolean, default: false },
      cleaning: { type: Boolean, default: false },
      infantCare: { type: Boolean, default: false },
      toddlerCare: { type: Boolean, default: false },
      specialNeeds: { type: Boolean, default: false },
      homeworkHelp: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      nightShift: { type: Boolean, default: false },
      weekendAvailable: { type: Boolean, default: false },
    },

    certifications: {
      firstAid: { type: Boolean, default: false },
      cpr: { type: Boolean, default: false },
    },

    documents: {
      idProof: { url: String, verified: { type: Boolean, default: false } },
      policeVerification: { url: String, verified: { type: Boolean, default: false } },
      resume: { url: String },
    },
    certificates: [{ title: String, url: String, verified: { type: Boolean, default: false } }],
    gallery: [String],

    backgroundVerified: { type: Boolean, default: false },
    policeVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    adminApprovalStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    responseTimeMinutes: { type: Number, default: 60 },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
    instantHire: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

nannySchema.index({ 'location.coordinates': '2dsphere' });
nannySchema.index({ rating: -1 });
nannySchema.index({ hourlyRate: 1, dailyRate: 1, monthlySalary: 1 });
nannySchema.index({ fullName: 'text', aboutMe: 'text' });

nannySchema.virtual('displayRate').get(function () {
  switch (this.pricingType) {
    case PRICING_TYPES.DAILY:
      return { type: 'daily', amount: this.dailyRate, label: '/day' };
    case PRICING_TYPES.MONTHLY:
      return { type: 'monthly', amount: this.monthlySalary, label: '/month' };
    default:
      return { type: 'hourly', amount: this.hourlyRate, label: '/hr' };
  }
});

module.exports = mongoose.model('Nanny', nannySchema);
