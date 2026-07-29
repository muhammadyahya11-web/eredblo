import GiftBox from '../models/GiftBox.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// Get current user's gift boxes
export const getMyGifts = async (req, res, next) => {
  try {
    const gifts = await GiftBox.find({ user: req.user._id }).sort({ createdAt: -1 });

    const now = Date.now();
    const formattedGifts = gifts.map((gift) => {
      const unlocksAtMs = new Date(gift.unlocksAt).getTime();
      const isReady = now >= unlocksAtMs;
      const remainingSeconds = isReady ? 0 : Math.ceil((unlocksAtMs - now) / 1000);

      return {
        ...gift.toObject(),
        isReady,
        remainingSeconds,
      };
    });

    res.json({
      success: true,
      data: formattedGifts,
    });
  } catch (error) {
    next(error);
  }
};

// Open a gift box (User)
export const openGift = async (req, res, next) => {
  try {
    const gift = await GiftBox.findById(req.params.id);

    if (!gift) {
      return res.status(404).json({ success: false, message: 'Gift box not found' });
    }

    if (gift.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to open this gift box' });
    }

    if (gift.isOpened) {
      return res.status(400).json({ success: false, message: 'This gift box has already been opened!' });
    }

    const now = Date.now();
    const unlocksAtMs = new Date(gift.unlocksAt).getTime();

    if (now < unlocksAtMs) {
      const remainingMinutes = Math.ceil((unlocksAtMs - now) / (60 * 1000));
      return res.status(400).json({
        success: false,
        message: `Gift box is locked! Please wait ${remainingMinutes} more minute(s) to open.`,
      });
    }

    // Mark gift as opened
    gift.isOpened = true;
    gift.openedAt = new Date();
    await gift.save();

    // If gift is Money, credit to user balance
    if (gift.giftType === 'Money' && gift.amount > 0) {
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { totalBalance: gift.amount, totalEarnings: gift.amount } }
      );

      await Transaction.create({
        user: req.user._id,
        type: 'Gift Reward',
        amount: gift.amount,
        isPositive: true,
        status: 'Success',
        description: `Opened Gift Box reward: ${gift.giftName}`,
        referenceId: gift._id,
      });
    }

    // Notify user
    await Notification.create({
      user: req.user._id,
      title: '🎁 Gift Box Opened!',
      message: gift.giftType === 'Money'
        ? `Congratulations! You unlocked your Gift Box and won PKR ${gift.amount.toLocaleString()}!`
        : `Congratulations! You unlocked your Gift Box and won a ${gift.giftName}! Please contact support to claim your physical reward.`,
      type: 'Offer',
      isImportant: true,
    });

    res.json({
      success: true,
      data: gift,
      message: `Congratulations! You opened your Gift Box and received ${gift.giftName}!`,
    });
  } catch (error) {
    next(error);
  }
};

// Admin send a gift box to user
export const adminSendGift = async (req, res, next) => {
  try {
    const { userId, giftType, giftName, amount, description, timerHours } = req.body;

    if (!userId || !giftName) {
      return res.status(400).json({ success: false, message: 'User ID and Gift Name are required' });
    }

    const hours = parseFloat(timerHours) || 2; // Default 2 hours
    const unlocksAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // If userId is 'all', send to all active users
    if (userId === 'all') {
      const activeUsers = await User.find({ status: 'active' }).select('_id');
      const giftDocs = activeUsers.map((u) => ({
        user: u._id,
        title: req.body.title || '🎁 Special Gift Box',
        giftType: giftType || 'Money',
        giftName,
        amount: parseFloat(amount) || 0,
        description: description || '',
        unlocksAt,
      }));

      await GiftBox.insertMany(giftDocs);

      // Create notifications for all users
      const notifications = activeUsers.map((u) => ({
        user: u._id,
        title: '🎁 Mystery Gift Box Received!',
        message: `Admin sent you a Gift Box! It will unlock in ${hours} hour(s). Check your Gift Box page.`,
        type: 'Offer',
        isImportant: true,
      }));
      await Notification.insertMany(notifications);

      return res.status(201).json({
        success: true,
        message: `Gift box sent to all ${activeUsers.length} active users! Unlocks in ${hours} hour(s).`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const gift = await GiftBox.create({
      user: userId,
      title: req.body.title || '🎁 Special Gift Box',
      giftType: giftType || 'Money',
      giftName,
      amount: parseFloat(amount) || 0,
      description: description || '',
      unlocksAt,
    });

    await Notification.create({
      user: userId,
      title: '🎁 Mystery Gift Box Received!',
      message: `Admin sent you a Gift Box containing: ${giftName}! It will unlock in ${hours} hour(s).`,
      type: 'Offer',
      isImportant: true,
    });

    res.status(201).json({
      success: true,
      data: gift,
      message: `Gift box sent successfully to ${user.name}! Unlocks in ${hours} hour(s).`,
    });
  } catch (error) {
    next(error);
  }
};

// Admin list all gift boxes
export const getAllGifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isOpened } = req.query;
    const filter = {};

    if (isOpened !== undefined && isOpened !== '') {
      filter.isOpened = isOpened === 'true';
    }

    const gifts = await GiftBox.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GiftBox.countDocuments(filter);

    res.json({
      success: true,
      data: gifts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// Admin delete gift box
export const deleteGift = async (req, res, next) => {
  try {
    const gift = await GiftBox.findByIdAndDelete(req.params.id);
    if (!gift) {
      return res.status(404).json({ success: false, message: 'Gift box not found' });
    }
    res.json({ success: true, message: 'Gift box deleted successfully' });
  } catch (error) {
    next(error);
  }
};
