import express from 'express';
import {
  getStats,
  getAllUsers,
  updateUserStatus,
  getAdmins,
  createAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { adminSendGift, getAllGifts as getAllGiftBoxes, deleteGift } from '../controllers/giftController.js';
import { protect, admin, superAdmin } from '../middlewares/authMiddleware.js';
import { validateCreateAdmin } from '../middlewares/validation.js';

const router = express.Router();

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);

router.get('/admins', protect, superAdmin, getAdmins);
router.post('/admins', protect, superAdmin, validateCreateAdmin, createAdmin);
router.delete('/admins/:id', protect, superAdmin, deleteAdmin);

// Gift Box Admin aliases
router.post('/gifts/send', protect, admin, adminSendGift);
router.get('/gifts/all', protect, admin, getAllGiftBoxes);
router.delete('/gifts/:id', protect, admin, deleteGift);

export default router;
