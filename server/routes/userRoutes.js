import express from 'express';
import { getUserProfile, updateUserProfile, getDashboardStats, getReferralStats } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateUpdateProfile } from '../middlewares/validation.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validateUpdateProfile, updateUserProfile);
router.get('/dashboard', protect, getDashboardStats);
router.get('/referral-stats', protect, getReferralStats);

export default router;
