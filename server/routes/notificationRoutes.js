import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification,
  getAllNotifications,
} from '../controllers/notificationController.js';
import { protect, admin, superAdmin } from '../middlewares/authMiddleware.js';
import { validateNotification } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.get('/all-admin', protect, admin, getAllNotifications);

// ⚠️ IMPORTANT: /read-all MUST be registered before /:id/read
// Otherwise Express matches "read-all" as the :id parameter, causing a CastError
router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);

router.post('/', protect, admin, validateNotification, createNotification);
router.delete('/:id', protect, deleteNotification);

export default router;
