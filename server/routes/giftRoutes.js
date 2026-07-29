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

// User routes
router.get('/my-gifts', protect, getMyGifts);
router.post('/:id/open', protect, openGift);

// Admin routes
router.post('/send', protect, admin, adminSendGift);
router.get('/admin/all', protect, admin, getAllGifts);
router.delete('/admin/:id', protect, admin, deleteGift);

export default router;
