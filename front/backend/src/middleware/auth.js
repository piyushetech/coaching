import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { mapDoc } from '../config/db.js';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    req.user = mapDoc(user);
    req.userDoc = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

export function ownerRequired(req, res, next) {
  if (req.user?.role !== 'admin' || !req.user?.isOwner) {
    return res.status(403).json({ success: false, message: 'Head admin access required' });
  }
  next();
}

export function isOwnerUser(user) {
  return !!user?.isOwner || user?.email?.toLowerCase() === 'owner@sankalp.com';
}

export function canAccessCourse(user, course) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (isOwnerUser(user)) return true;
  return (user.courses ?? []).includes(course);
}
