import { Router } from 'express';
import { MockExam, ExamAttempt } from '../models/MockExam.js';
import { Notification } from '../models/Notification.js';
import { mapDoc, mapDocs } from '../config/db.js';
import { authRequired, adminRequired, canAccessCourse, isOwnerUser } from '../middleware/auth.js';
import { generateQuestions, performanceTier } from '../utils/questions.js';

const COURSE_LABELS = {
  jee: 'JEE',
  neet: 'NEET',
  'mht-cet': 'MHT-CET',
  foundation: 'Foundation',
  boards: 'Boards'
};

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const all = await MockExam.find().sort({ createdAt: -1 });
    const exams = mapDocs(all).map((e) => ({
      ...e,
      createdAt: e.createdAt?.slice?.(0, 10) ?? e.createdAt
    }));
    const filtered = isOwnerUser(req.user)
      ? exams
      : exams.filter((e) => canAccessCourse(req.user, e.course));
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', adminRequired, async (req, res) => {
  try {
    const { title, examType, course, description, questions, durationMinutes } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Exam title is required' });
    if (!isOwnerUser(req.user) && !canAccessCourse(req.user, course)) {
      return res.status(403).json({ success: false, message: 'No access to this course' });
    }

    const exam = await MockExam.create({
      title: title.trim(),
      examType: examType?.trim() || 'JEE',
      course,
      description: description?.trim() || `Mock exam for ${COURSE_LABELS[course] || course}`,
      questions: questions ?? 50,
      durationMinutes: durationMinutes ?? 60,
      sections: ['Aptitude', 'Math', 'GK', 'English'],
      createdBy: req.user.id
    });

    const date = new Date().toISOString().slice(0, 10);
    await Notification.create({
      title: 'New Mock Exam Added',
      message: `${exam.title} is now available for ${COURSE_LABELS[course] || course} students.`,
      date,
      type: 'info',
      targetRole: 'student',
      targetCourses: [course],
      readBy: []
    });

    const mapped = mapDoc(exam);
    mapped.createdAt = date;
    res.status(201).json(mapped);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/questions', async (req, res) => {
  try {
    const exam = await MockExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (!isOwnerUser(req.user) && !canAccessCourse(req.user, exam.course)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json(generateQuestions(exam._id.toString(), exam.questions));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/attempts', async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can submit attempts' });
    }
    const exam = await MockExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const { score, total, accuracy, timeTaken } = req.body;
    const attempt = await ExamAttempt.create({
      studentId: req.user.id,
      studentName: req.user.name,
      examId: exam._id,
      examTitle: exam.title,
      examType: exam.examType,
      course: exam.course,
      score,
      total,
      accuracy,
      timeTaken,
      date: new Date().toISOString().slice(0, 10)
    });
    res.status(201).json(mapDoc(attempt));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/attempts/student/:studentId', async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.studentId;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const attempts = await ExamAttempt.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(mapDocs(attempts));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/attempts/performance/:studentId', async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.studentId;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const attempts = await ExamAttempt.find({ studentId: req.params.studentId });
    const avg = attempts.length
      ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length)
      : null;
    res.json({ avg, tier: performanceTier(avg), attempts: attempts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
