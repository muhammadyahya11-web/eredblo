import express from 'express';
import {
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
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-otp', validateOTP, verifyOTP);
router.post('/send-login-otp', validateSendLoginOTP, sendLoginOTP);
router.post('/login-with-otp', validateLoginWithOTP, loginWithOTP);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, resetPassword);
router.put('/change-password', protect, validateChangePassword, changePassword);

export default router;
