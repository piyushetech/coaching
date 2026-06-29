require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Admin } = require('../models');

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@nannyconnect.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const user = await User.create({
    email,
    password,
    role: 'admin',
    isEmailVerified: true,
  });

  await Admin.create({ user: user._id, fullName: 'Super Admin' });
  console.log(`Admin created: ${email} / ${password}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
