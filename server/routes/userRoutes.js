import express from 'express';
import multer from 'multer';
import { getUserProfile, updateUserProfile, getDashboardStats, getReferralStats, uploadProfilePicture } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateUpdateProfile } from '../middlewares/validation.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validateUpdateProfile, updateUserProfile);
router.post('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.get('/dashboard', protect, getDashboardStats);
router.get('/referral-stats', protect, getReferralStats);

export default router;
