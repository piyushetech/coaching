import { Router } from 'express';
import { User } from '../models/User.js';
import { TeacherRating, StudentFeedback, TeacherAppreciation } from '../models/Feedback.js';
import { mapDoc, mapDocs } from '../config/db.js';
import { authRequired, ownerRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/teachers', async (_req, res) => {
  try {
    const teachers = await User.find({ role: 'admin' }).sort({ name: 1 });
    res.json(mapDocs(teachers));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/ratings', async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can rate teachers.' });
    }
    const { teacherId, rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    const teacher = await User.findOne({ _id: teacherId, role: 'admin' });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

    const date = new Date().toISOString().slice(0, 10);
    const existing = await TeacherRating.findOne({ studentId: req.user.id, teacherId });
    let doc;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment?.trim();
      existing.date = date;
      existing.studentName = req.user.name;
      doc = await existing.save();
    } else {
      doc = await TeacherRating.create({
        studentId: req.user.id,
        studentName: req.user.name,
        teacherId,
        rating,
        comment: comment?.trim(),
        date
      });
    }
    res.json({ success: true, message: 'Rating submitted. Thank you!', rating: mapDoc(doc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ratings/my/:teacherId', async (req, res) => {
  try {
    const rating = await TeacherRating.findOne({ studentId: req.user.id, teacherId: req.params.teacherId });
    res.json(rating ? mapDoc(rating) : null);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ratings/summary', ownerRequired, async (_req, res) => {
  try {
    const teachers = await User.find({ role: 'admin' });
    const ratings = await TeacherRating.find();
    const summaries = teachers.map((teacher) => {
      const teacherRatings = ratings.filter((r) => r.teacherId.toString() === teacher._id.toString());
      const count = teacherRatings.length;
      const average = count
        ? Math.round((teacherRatings.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
        : 0;
      return {
        teacher: mapDoc(teacher),
        count,
        average,
        ratings: mapDocs(teacherRatings)
      };
    });
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/student/:studentId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can give feedback.' });
    }
    const message = req.body.message?.trim();
    if (!message) return res.status(400).json({ success: false, message: 'Feedback message is required.' });

    const student = await User.findOne({ _id: req.params.studentId, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const date = new Date().toISOString().slice(0, 10);
    const existingId = req.body.feedbackId;
    if (existingId) {
      const entry = await StudentFeedback.findOne({ _id: existingId, teacherId: req.user.id, studentId: student._id });
      if (!entry) return res.status(404).json({ success: false, message: 'Feedback not found.' });
      entry.message = message;
      entry.date = date;
      entry.teacherName = req.user.name;
      await entry.save();
      return res.json({ success: true, message: 'Feedback updated for ' + student.name, feedback: mapDoc(entry) });
    }

    const entry = await StudentFeedback.create({
      studentId: student._id,
      teacherId: req.user.id,
      teacherName: req.user.name,
      message,
      date
    });
    res.status(201).json({ success: true, message: 'Feedback saved for ' + student.name, feedback: mapDoc(entry) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/student/entry/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can edit feedback.' });
    }
    const message = req.body.message?.trim();
    if (!message) return res.status(400).json({ success: false, message: 'Feedback message is required.' });

    const entry = await StudentFeedback.findOne({ _id: req.params.id, teacherId: req.user.id });
    if (!entry) return res.status(404).json({ success: false, message: 'Feedback not found.' });

    entry.message = message;
    entry.date = new Date().toISOString().slice(0, 10);
    entry.teacherName = req.user.name;
    await entry.save();
    res.json({ success: true, message: 'Feedback updated.', feedback: mapDoc(entry) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/student/:studentId/from-me', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const list = await StudentFeedback.find({
      studentId: req.params.studentId,
      teacherId: req.user.id
    }).sort({ createdAt: -1 });
    res.json(mapDocs(list));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/appreciation/:teacherId', async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can send appreciation.' });
    }
    const message = req.body.message?.trim();
    if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

    const teacher = await User.findOne({ _id: req.params.teacherId, role: 'admin' });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

    const date = new Date().toISOString().slice(0, 10);
    const existing = await TeacherAppreciation.findOne({ studentId: req.user.id, teacherId: teacher._id });
    let doc;
    if (existing) {
      existing.message = message;
      existing.date = date;
      existing.studentName = req.user.name;
      doc = await existing.save();
    } else {
      doc = await TeacherAppreciation.create({
        studentId: req.user.id,
        studentName: req.user.name,
        teacherId: teacher._id,
        message,
        date
      });
    }
    res.json({
      success: true,
      message: existing ? 'Appreciation updated.' : 'Appreciation sent. Thank you!',
      appreciation: mapDoc(doc)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/appreciation/my', async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const list = await TeacherAppreciation.find({ studentId: req.user.id }).sort({ updatedAt: -1 });
    res.json(mapDocs(list));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/appreciation/received', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const list = await TeacherAppreciation.find({ teacherId: req.user.id }).sort({ updatedAt: -1 });
    res.json(mapDocs(list));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.studentId;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const list = await StudentFeedback.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(mapDocs(list));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my', async (req, res) => {
  try {
    const list = await StudentFeedback.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(mapDocs(list));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
