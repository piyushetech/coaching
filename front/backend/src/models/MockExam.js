import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    examType: { type: String, required: true },
    course: { type: String, required: true },
    description: { type: String, default: '' },
    questions: { type: Number, default: 50 },
    durationMinutes: { type: Number, default: 60 },
    sections: { type: [String], default: ['Aptitude', 'Math', 'GK', 'English'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const MockExam = mongoose.model('MockExam', examSchema);

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockExam', required: true },
    examTitle: { type: String, required: true },
    examType: { type: String, required: true },
    course: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTaken: { type: String, required: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

export const ExamAttempt = mongoose.model('ExamAttempt', attemptSchema);
