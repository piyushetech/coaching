import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true },
    readBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    type: { type: String, enum: ['info', 'success', 'alert'], default: 'info' },
    targetRole: { type: String, enum: ['student', 'admin', 'all'], default: 'all' },
    targetCourses: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
