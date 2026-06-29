const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: 'Nanny', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ parent: 1, nanny: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
