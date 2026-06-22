import { Router } from 'express';
import { Course, slugifyCourseId } from '../models/Course.js';
import { MediaItem } from '../models/MediaItem.js';
import { MockExam } from '../models/MockExam.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = Router();

function mapCourse(doc) {
  return { id: doc.id, label: doc.label };
}

router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find().sort({ label: 1 });
    res.json(courses.map(mapCourse));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { label } = req.body;
    if (!label?.trim()) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }

    const trimmed = label.trim();
    const id = slugifyCourseId(trimmed);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Enter a valid course name' });
    }

    const exists = await Course.findOne({ id });
    if (exists) {
      return res.status(409).json({ success: false, message: 'A course with this name already exists' });
    }

    const course = await Course.create({ id, label: trimmed });
    res.status(201).json({ success: true, message: `Course "${trimmed}" added`, course: mapCourse(course) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const id = req.params.id?.toLowerCase();
    const course = await Course.findOne({ id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [mediaCount, examCount, userCount, notifCount] = await Promise.all([
      MediaItem.countDocuments({ course: id }),
      MockExam.countDocuments({ course: id }),
      User.countDocuments({ courses: id }),
      Notification.countDocuments({ targetCourses: id })
    ]);

    if (mediaCount + examCount + userCount + notifCount > 0) {
      const parts = [];
      if (mediaCount) parts.push(`${mediaCount} file(s)`);
      if (examCount) parts.push(`${examCount} exam(s)`);
      if (userCount) parts.push(`${userCount} user(s)`);
      if (notifCount) parts.push(`${notifCount} notification(s)`);
      return res.status(409).json({
        success: false,
        message: `Cannot delete — still used by ${parts.join(', ')}. Remove those first.`
      });
    }

    await course.deleteOne();
    res.json({ success: true, message: `Course "${course.label}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
