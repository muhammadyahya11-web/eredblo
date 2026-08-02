import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { validateNotification } from '../middlewares/validation.js';

const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    const filter = {
      $or: [
        { user: req.user._id },
        { user: null },
      ],
    };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.json({ success: true, data: notifications, total, unreadCount, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const isOwner = !notification.user || notification.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ user: req.user._id }, { user: null }],
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, userId, isImportant } = req.body;

    if (userId) {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type: type || 'System',
        isImportant: isImportant || false,
      });
      res.status(201).json({ success: true, data: notification, message: 'Notification sent' });
    } else {
      const notifications = [];
      const users = await User.find({}).select('_id');
      for (const u of users) {
        notifications.push({
          user: u._id,
          title,
          message,
          type: type || 'System',
          isImportant: isImportant || false,
        });
      }
      await Notification.insertMany(notifications);
      res.status(201).json({ success: true, message: 'Broadcast notification sent to all users' });
    }
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user && notification.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (req.query.userId) filter.user = req.query.userId;

    const notifications = await Notification.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    res.json({ success: true, data: notifications, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification,
  getAllNotifications,
};
