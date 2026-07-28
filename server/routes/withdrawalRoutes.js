import express from 'express';
import { createWithdrawal, getUserWithdrawals, getAllWithdrawals, updateWithdrawalStatus } from '../controllers/withdrawalController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateWithdrawal } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', protect, validateWithdrawal, createWithdrawal);
router.get('/my-withdrawals', protect, getUserWithdrawals);
router.get('/', protect, admin, getAllWithdrawals);
router.put('/:id/status', protect, admin, updateWithdrawalStatus);

export default router;
