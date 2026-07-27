import express from 'express';
import { getUserTransactions, getAllTransactions } from '../controllers/transactionController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-transactions', protect, getUserTransactions);
router.get('/', protect, admin, getAllTransactions);

export default router;
