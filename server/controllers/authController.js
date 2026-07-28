import User from '../models/User.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import {
  validateRegister,
  validateLogin,
  validateOTP,
  validateSendLoginOTP,
  validateLoginWithOTP,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../middlewares/validation.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

const loginLimiter = new Map();

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      referredBy,
    });

    if (user) {
      const otpCode = crypto.randomInt(100000, 999999).toString();
      await OTP.create({ email, otp: otpCode });

      try {
        await sendEmail({
          email: user.email,
          subject: 'ERED BLOO - Verify your email',
          message: `Your OTP is: ${otpCode}. It will expire in 5 minutes. Do not share this with anyone.`,
        });
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError);
      }

      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        message: 'Registration successful. Please verify your email with the OTP sent.',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    const limiterKey = `${clientIP}:${email}`;
    const attempts = loginLimiter.get(limiterKey) || { count: 0, lastAttempt: 0 };

    if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOCKOUT_DURATION) {
      const remainingMs = LOCKOUT_DURATION - (Date.now() - attempts.lastAttempt);
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({ success: false, message: `Too many failed attempts. Try again in ${remainingMin} minutes.` });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      attempts.count = (attempts.count || 0) + 1;
      attempts.lastAttempt = Date.now();
      loginLimiter.set(limiterKey, attempts);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the admin.' });
    }

    if (user.isLocked && user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(403).json({ success: false, message: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementFailedLogin();
      attempts.count = (attempts.count || 0) + 1;
      attempts.lastAttempt = Date.now();
      loginLimiter.set(limiterKey, attempts);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await user.resetFailedLogin();
    loginLimiter.delete(limiterKey);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();
    await OTP.deleteMany({ email });

    res.json({
      success: true,
      message: 'Email verified successfully',
      token: generateToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    next(error);
  }
};

const sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

    try {
      await sendEmail({
        email: user.email,
        subject: 'ERED BLOO - Your Login OTP',
        message: `Your login OTP is: ${otpCode}. It will expire in 5 minutes. Do not share this with anyone.`,
      });
    } catch (emailError) {
      console.error('Error sending login OTP email:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

const loginWithOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the admin.' });
    }

    await user.resetFailedLogin();
    await OTP.deleteMany({ email });

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes. If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'ERED BLOO - Password Reset',
        message,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful', token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(req.body.oldPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  verifyOTP,
  sendLoginOTP,
  loginWithOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  validateRegister,
  validateLogin,
  validateOTP,
  validateSendLoginOTP,
  validateLoginWithOTP,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
};
