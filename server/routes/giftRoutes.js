import express from 'express';
import {
  getMyGifts,
  openGift,
  adminSendGift,
  getAllGifts,
  deleteGift,
} from '../controllers/giftController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Static Admin routes first
router.post('/send', protect, admin, adminSendGift);
router.get('/admin/all', protect, admin, getAllGifts);

// 2. User routes
router.get('/my-gifts', protect, getMyGifts);

// 3. Parameterized routes last
router.post('/:id/open', protect, openGift);
router.delete('/admin/:id', protect, admin, deleteGift);

export default router;
