import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{6,14}|0\d{6,14}$/, 'Please provide a valid phone number'],
    },
    cnic: {
      type: String,
      match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format 00000-0000000-0'],
    },
    profilePicture: {
      type: String,
      default: 'default-avatar.png',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super-admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    totalBalance: { type: Number, default: 0 },
    totalInvestment: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },

    referralCode: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    referredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    referralEarnings: { type: Number, default: 0 },
    referralBonusesGiven: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.pre('save', function () {
  if (!this.referralCode) {
    this.referralCode = cryptoRandomString(6);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// True while a lockout window is active
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockoutUntil && this.lockoutUntil.getTime() > Date.now());
});

userSchema.methods.incrementFailedLogin = async function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
    this.failedLoginAttempts = 0;
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetFailedLogin = async function () {
  this.failedLoginAttempts = 0;
  this.lockoutUntil = null;
  await this.save({ validateBeforeSave: false });
};

function cryptoRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

const User = mongoose.model('User', userSchema);
export default User;
