import express from 'express';
import { getEarningsOverview, getPlatformEarnings } from '../controllers/earningsController.js';
import { protect, admin, superAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-earnings', protect, getEarningsOverview);
router.get('/platform', protect, admin, getPlatformEarnings);

export default router;
