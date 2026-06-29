const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: String,
    emailVerificationExpires: Date,
    passwordResetOTP: String,
    passwordResetExpires: Date,
    refreshToken: String,
    fcmToken: String,
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    lastLogin: Date,
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'role',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerificationOTP;
  delete obj.passwordResetOTP;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
