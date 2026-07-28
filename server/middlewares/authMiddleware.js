import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account has been blocked' });
      }

      if (user.isLocked && user.lockoutUntil && user.lockoutUntil > Date.now()) {
        const minutesLeft = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
        return res.status(403).json({ success: false, message: `Account locked. Try again in ${minutesLeft} minutes.` });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super-admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as a super admin' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ success: false, message: `Not authorized. Requires one of: ${roles.join(', ')}` });
    }
  };
};

export { protect, admin, superAdmin, authorize };
