import { User } from '../models/User.js';

/** Normalize Indian mobile to 10 digits (handles +91, leading 0, spaces). */
export function normalizeMobile(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(-10);
  if (digits.length === 10) return digits;
  return null;
}

export async function findUserByMobile(rawMobile) {
  const normalized = normalizeMobile(rawMobile);
  if (!normalized) return null;

  const users = await User.find({ 'profile.mobile': { $exists: true, $nin: [null, ''] } });
  return users.find((u) => normalizeMobile(u.profile?.mobile) === normalized) ?? null;
}
