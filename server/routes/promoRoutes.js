import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createPromoCode,
  getAllPromoCodes,
  updatePromoCode,
  deletePromoCode,
} from '../controllers/promoController.js';

const router = express.Router();

// All promo routes are protected and require admin privileges
router.use(protect);
router.use(admin);

router.route('/')
  .post(createPromoCode)
  .get(getAllPromoCodes);

router.route('/:id')
  .put(updatePromoCode)
  .delete(deletePromoCode);

export default router;
