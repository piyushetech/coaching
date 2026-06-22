import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);

export const DEFAULT_COURSES = [
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
  { id: 'gk', label: 'GK' },
  { id: 'ssc', label: 'SSC' },
  { id: 'up-police', label: 'UP Police' }
];

export function slugifyCourseId(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function seedCourses() {
  for (const c of DEFAULT_COURSES) {
    await Course.updateOne({ id: c.id }, { $set: c }, { upsert: true });
  }
}
