const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageNannies: { type: Boolean, default: true },
      manageReviews: { type: Boolean, default: true },
      manageReports: { type: Boolean, default: true },
      managePayments: { type: Boolean, default: true },
      viewAnalytics: { type: Boolean, default: true },
      manageCMS: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
