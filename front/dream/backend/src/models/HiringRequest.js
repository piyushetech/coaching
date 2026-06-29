const mongoose = require('mongoose');
const { HIRING_STATUS } = require('../utils/constants');

const hiringRequestSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: 'Nanny', required: true },
    status: {
      type: String,
      enum: Object.values(HIRING_STATUS),
      default: HIRING_STATUS.PENDING,
    },
    message: String,
    pricingType: { type: String, enum: ['hourly', 'daily', 'monthly'], default: 'hourly' },
    agreedRate: Number,
    startDate: Date,
    endDate: Date,
    schedule: {
      days: [String],
      startTime: String,
      endTime: String,
    },
    interview: {
      scheduledAt: Date,
      location: String,
      meetingLink: String,
      notes: String,
    },
    chatEnabled: { type: Boolean, default: false },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    completedAt: Date,
  },
  { timestamps: true }
);

hiringRequestSchema.index({ parent: 1, status: 1 });
hiringRequestSchema.index({ nanny: 1, status: 1 });

module.exports = mongoose.model('HiringRequest', hiringRequestSchema);
