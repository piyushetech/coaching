import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    date: { type: String, required: true }
  },
  { timestamps: true }
);

ratingSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });

export const TeacherRating = mongoose.model('TeacherRating', ratingSchema);

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherName: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

export const StudentFeedback = mongoose.model('StudentFeedback', feedbackSchema);

const appreciationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

appreciationSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });

export const TeacherAppreciation = mongoose.model('TeacherAppreciation', appreciationSchema);
