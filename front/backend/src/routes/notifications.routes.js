import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { mapDoc } from '../config/db.js';
import { authRequired, isOwnerUser } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

function isVisibleToUser(n, user) {
  const role = n.targetRole ?? 'all';
  if (role === 'all') return true;
  if (role === 'student' && user.role !== 'student') return false;
  if (role === 'admin' && user.role !== 'admin') return false;
  if (n.targetCourses?.length) {
    if (isOwnerUser(user)) return true;
    const userCourses = user.courses ?? [];
    return n.targetCourses.some((c) => userCourses.includes(c));
  }
  return true;
}

router.get('/', async (req, res) => {
  try {
    const all = await Notification.find().sort({ createdAt: -1 });
    const list = all
      .filter((n) => isVisibleToUser(mapDoc(n), req.user))
      .map((n) => {
        const obj = mapDoc(n);
        obj.read = (n.readBy ?? []).some((id) => id.toString() === req.user.id);
        delete obj.readBy;
        return obj;
      });
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    const all = await Notification.find();
    const userId = req.user.id;
    for (const n of all) {
      if (!isVisibleToUser(mapDoc(n), req.user)) continue;
      if (!n.readBy.some((id) => id.toString() === userId)) {
        n.readBy.push(userId);
        await n.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (!n.readBy.some((id) => id.toString() === req.user.id)) {
      n.readBy.push(req.user.id);
      await n.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
