const mongoose = require('mongoose');

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

const parentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: String,
    profilePicture: String,
    budget: { type: Number, min: 0 },
    location: locationSchema,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    favoriteNannies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nanny' }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nanny' }],
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    preferredLanguage: { type: String, default: 'en' },
    referralCode: String,
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

parentSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Parent', parentSchema);
