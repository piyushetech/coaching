import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
import { MediaItem } from './models/MediaItem.js';
import { MockExam } from './models/MockExam.js';
import { Notification } from './models/Notification.js';
import { FeedPost } from './models/FeedPost.js';
import { seedCourses } from './models/Course.js';

export async function seedDatabase() {
  const ownerEmail = 'owner@sankalp.com';
  const owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    await User.create({
      name: 'Institute Owner',
      email: ownerEmail,
      password: await bcrypt.hash('password', 10),
      role: 'admin',
      isOwner: true,
      courses: [],
      profile: { mobile: '7619548975' }
    });
    console.log('Seeded head admin: owner@sankalp.com / password (mobile OTP: 7619548975)');
  } else if (!owner.profile?.mobile) {
    owner.profile = { ...owner.profile?.toObject?.() ?? owner.profile, mobile: '7619548975' };
    await owner.save();
  }
  await seedCourses();
}

export async function clearDemoData() {
  const [media, exams, notifs, feed] = await Promise.all([
    MediaItem.deleteMany({}),
    MockExam.deleteMany({}),
    Notification.deleteMany({}),
    FeedPost.deleteMany({})
  ]);
  console.log(
    `Cleared: ${media.deletedCount} media, ${exams.deletedCount} exams, ${notifs.deletedCount} notifications, ${feed.deletedCount} feed posts`
  );
}

if (process.argv[1]?.includes('seed.js')) {
  connectDb()
    .then(seedDatabase)
    .then(() => {
      console.log('Seed complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
