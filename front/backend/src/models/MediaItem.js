import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'video'], required: true },
    url: { type: String, required: true },
    course: { type: String, required: true },
    thumbnail: String,
    description: String,
    size: String,
    sizeBytes: { type: Number, default: 0 },
    dateModified: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const MediaItem = mongoose.model('MediaItem', mediaSchema);
