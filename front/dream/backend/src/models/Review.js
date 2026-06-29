const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: 'Nanny', required: true },
    hiringRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringRequest' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ nanny: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
