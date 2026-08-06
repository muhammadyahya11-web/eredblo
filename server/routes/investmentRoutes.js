import express from 'express';
import {
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  getInvestmentById,
  updateInvestment,
  addProfitToInvestments,
  cancelInvestment,
} from '../controllers/investmentController.js';
import { protect, admin, superAdmin } from '../middlewares/authMiddleware.js';
import { validateInvestment } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', protect, validateInvestment, createInvestment);
router.get('/my-investments', protect, getUserInvestments);

// Admin
router.get('/', protect, admin, getAllInvestments);
router.post('/distribute-profit', protect, superAdmin, addProfitToInvestments);

// Keep the parameterized route last so it does not shadow the literal routes above
router.get('/:id', protect, getInvestmentById);
router.put('/:id', protect, superAdmin, updateInvestment);
router.delete('/:id', protect, cancelInvestment);

export default router;
