import express from 'express';
import { createPlan, getPlans, getPlanById, updatePlan, deletePlan } from '../controllers/planController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateCreatePlan } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', protect, admin, validateCreatePlan, createPlan);
router.put('/:id', protect, admin, validateCreatePlan, updatePlan);
router.delete('/:id', protect, admin, deletePlan);

export default router;
