import express from 'express';
import {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  replyToTicket,
} from '../controllers/supportController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateSupportReply, validateSupportTicket } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', protect, validateSupportTicket, createTicket);
router.get('/my-tickets', protect, getUserTickets);
router.get('/', protect, admin, getAllTickets);
router.get('/:id', protect, getTicketById);
router.put('/:id/status', protect, admin, updateTicketStatus);
router.post('/:id/reply', protect, validateSupportReply, replyToTicket);

export default router;
