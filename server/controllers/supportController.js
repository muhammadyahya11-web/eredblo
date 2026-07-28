import User from '../models/User.js';
import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';
import { validateSupportTicket } from '../middlewares/validation.js';

const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      category,
      replies: [
        {
          user: req.user._id,
          message,
          isAdmin: false,
        },
      ],
    });

    res.status(201).json({ success: true, data: ticket, message: 'Support ticket created successfully' });
  } catch (error) {
    next(error);
  }
};

const getUserTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(filter);

    res.json({ success: true, data: tickets, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.query.userId) filter.user = req.query.userId;

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(filter);

    res.json({ success: true, data: tickets, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user', 'name email');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isOwner = ticket.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Open, In Progress, or Closed' });
    }

    const ticket = await SupportTicket.findById(req.params.id).populate('user');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.json({ success: true, data: ticket, message: 'Ticket status updated' });
  } catch (error) {
    next(error);
  }
};

const replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';
    const isOwner = ticket.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    ticket.replies.push({
      user: req.user._id,
      message,
      isAdmin,
    });
    await ticket.save();

    if (!isOwner && ticket.status === 'Open') {
      ticket.status = 'In Progress';
      await ticket.save();
    }

    if (isAdmin) {
      await Notification.create({
        user: ticket.user,
        title: 'Support Ticket Update',
        message: `Admin replied to your ticket: "${ticket.subject}"`,
        type: 'System',
        isImportant: true,
      });
    }

    res.json({ success: true, data: ticket, message: 'Reply added successfully' });
  } catch (error) {
    next(error);
  }
};

export { createTicket, getUserTickets, getAllTickets, getTicketById, updateTicketStatus, replyToTicket };
