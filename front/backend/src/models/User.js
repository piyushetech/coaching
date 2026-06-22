import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    mobile: String,
    address: String,
    education: String,
    educationMarks: String,
    avatarUrl: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], required: true },
    isOwner: { type: Boolean, default: false },
    courses: { type: [String], default: [] },
    profile: { type: profileSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
