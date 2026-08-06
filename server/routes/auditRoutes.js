import express from 'express';
import { protect, superAdmin } from '../middlewares/authMiddleware.js';
import { getAuditLogs, deleteAuditLog, clearAllAuditLogs } from '../controllers/auditController.js';

const router = express.Router();
router.use(protect, superAdmin);

router.get('/', getAuditLogs);
router.delete('/clear-all', clearAllAuditLogs);
router.delete('/:id', deleteAuditLog);

export default router;
