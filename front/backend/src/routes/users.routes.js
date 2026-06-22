import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { mapDoc, mapDocs } from '../config/db.js';
import { authRequired, adminRequired, ownerRequired, isOwnerUser } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', adminRequired, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(mapDocs(users));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', adminRequired, async (req, res) => {
  try {
    const { name, email, password, role, mobile, address, education, educationMarks, courses } = req.body;
    if (role === 'admin' && !isOwnerUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Only the head admin can create admin accounts.' });
    }
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: role === 'admin' ? 'admin' : 'student',
      isOwner: false,
      courses: courses ?? [],
      profile: { mobile, address, education, educationMarks }
    });

    const label = user.role === 'admin' ? 'Admin' : 'Student';
    res.status(201).json({ success: true, message: `${label} account created for ${user.email}`, user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      if (!isOwnerUser(req.user)) {
        return res.status(403).json({ success: false, message: 'Only the head admin can edit admin accounts.' });
      }
      if (isOwnerUser(mapDoc(user))) {
        return res.status(403).json({ success: false, message: 'Use Profile settings to update the head admin account.' });
      }
      if (req.body.name?.trim()) user.name = req.body.name.trim();
      if (req.body.email !== undefined) {
        const email = req.body.email.trim().toLowerCase();
        if (!email.includes('@')) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
        const dup = await User.findOne({ email, _id: { $ne: user._id } });
        if (dup) return res.status(409).json({ success: false, message: 'Email already registered to another user.' });
        user.email = email;
      }
      if (req.body.mobile !== undefined) {
        user.profile = { ...user.profile?.toObject?.() ?? user.profile, mobile: req.body.mobile.trim() };
      }
      await user.save();
      return res.json({ success: true, message: 'Admin details updated.', user: mapDoc(user) });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Only student or admin accounts can be edited.' });
    }

    if (req.body.email !== undefined) {
      const email = req.body.email.trim().toLowerCase();
      if (!email.includes('@')) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      const dup = await User.findOne({ email, _id: { $ne: user._id } });
      if (dup) return res.status(409).json({ success: false, message: 'Email already registered to another user.' });
      user.email = email;
    }
    if (req.body.mobile !== undefined) {
      user.profile = { ...user.profile?.toObject?.() ?? user.profile, mobile: req.body.mobile.trim() };
    }
    await user.save();
    res.json({ success: true, message: 'Student details updated.', user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/courses', adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isOwnerUser(mapDoc(user))) {
      return res.status(403).json({ success: false, message: 'Cannot change head admin courses.' });
    }
    user.courses = req.body.courses ?? [];
    await user.save();
    res.json({ success: true, user: mapDoc(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', adminRequired, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isOwnerUser(mapDoc(user))) {
      return res.status(403).json({ success: false, message: 'Cannot delete the head admin account.' });
    }
    if (user.role === 'admin' && !isOwnerUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Only the head admin can delete admin accounts.' });
    }
    await user.deleteOne();
    res.json({ success: true, message: `${user.name} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
