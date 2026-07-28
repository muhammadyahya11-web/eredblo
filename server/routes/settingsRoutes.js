import express from 'express';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingsController.js';
import { protect, superAdmin } from '../middlewares/authMiddleware.js';
import { validateSettingsUpdate } from '../middlewares/validation.js';

const router = express.Router();

router.get('/public', getPublicSettings);
router.get('/', protect, superAdmin, getSettings);
router.put('/', protect, superAdmin, validateSettingsUpdate, updateSettings);

export default router;
