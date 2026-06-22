import { Router } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { mapDoc } from '../config/db.js';
import { authRequired, signToken } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

function deleteAvatarFile(avatarUrl) {
  if (!avatarUrl?.startsWith('/uploads/avatars/')) return;
  const filePath = path.join(__dirname, '../../uploads/avatars', path.basename(avatarUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, courses } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const courseIds = Array.isArray(courses)
      ? [...new Set(courses.map((c) => String(c).trim().toLowerCase()).filter(Boolean))]
      : [];
    if (!courseIds.length) {
      return res.status(400).json({ success: false, message: 'Select at least one course' });
    }

    const validCourses = await Course.find({ id: { $in: courseIds } });
    if (validCourses.length !== courseIds.length) {
      return res.status(400).json({ success: false, message: 'One or more selected courses are invalid' });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role: 'student',
      courses: courseIds,
      profile: {}
    });

    const safe = mapDoc(user);
    const token = signToken(user._id.toString());
    res.status(201).json({ success: true, token, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password. Please check your username and password.'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password. Please check your username and password.'
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password. Please check your username and password.'
      });
    }

    const safe = mapDoc(user);
    const token = signToken(user._id.toString());
    res.json({ success: true, token, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  res.json({ success: true, message: 'Reset instructions sent to your email' });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.patch('/profile', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { avatarUrl, ...rest } = req.body;
    user.profile = { ...user.profile?.toObject?.() ?? user.profile, ...rest };
    await user.save();
    res.json({ success: true, message: 'Profile updated', user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/profile/avatar', authRequired, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    deleteAvatarFile(user.profile?.avatarUrl);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.profile = { ...user.profile?.toObject?.() ?? user.profile, avatarUrl };
    await user.save();

    res.json({ success: true, message: 'Profile photo updated', user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/profile/avatar', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    deleteAvatarFile(user.profile?.avatarUrl);
    user.profile = { ...user.profile?.toObject?.() ?? user.profile, avatarUrl: undefined };
    await user.save();

    res.json({ success: true, message: 'Profile photo removed', user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
