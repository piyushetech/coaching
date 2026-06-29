const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: 'Nanny', required: true },
    hiringRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringRequest' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    pricingType: { type: String, enum: ['hourly', 'daily', 'monthly'] },
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
