import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import cloudinary from '../config/cloudinary.js';
import { distributeReferralCommission } from '../utils/referralCommission.js';
import { checkAndAwardReferralBonus } from '../utils/referralBonus.js';
import GiftBox from '../models/GiftBox.js';

const cloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

const resolveScreenshotUrl = async (file) => {
  if (!file) return '';
  if (!cloudinaryConfigured()) {
    throw new Error('Screenshot storage is not configured. Set Cloudinary environment variables.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ered-bloo/deposits', resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(new Error('Failed to upload payment screenshot'));
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

const createDeposit = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    const amt = parseFloat(amount);

    const settings = await Settings.findOne();
    const minDeposit = settings?.minimumDeposit ?? 300;
    if (amt < minDeposit) {
      return res.status(400).json({ success: false, message: `Minimum deposit is ${minDeposit}` });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }

    const existingDeposit = await Deposit.findOne({ transactionId });
    if (existingDeposit) {
      return res.status(400).json({ success: false, message: 'Transaction ID already used' });
    }

    const screenshot = await resolveScreenshotUrl(req.file);

    const deposit = await Deposit.create({
      user: req.user._id,
      amount: amt,
      paymentMethod,
      transactionId,
      screenshot,
      status: 'Pending',
    });

    await Transaction.create({
      user: req.user._id,
      type: 'Deposit',
      amount: amt,
      isPositive: true,
      status: 'Pending',
      description: `Deposit request via ${paymentMethod}`,
      referenceId: deposit._id,
    });

    res.status(201).json({
      success: true,
      data: deposit,
      message: 'Deposit request submitted. Awaiting admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

const getUserDeposits = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const deposits = await Deposit.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deposit.countDocuments(filter);

    res.json({ success: true, data: deposits, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getAllDeposits = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.query.userId) filter.user = req.query.userId;

    const deposits = await Deposit.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deposit.countDocuments(filter);

    res.json({ success: true, data: deposits, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject a deposit.
 *  - Uses a status-guarded atomic transition to prevent double crediting.
 *  - On approval: credits the balance atomically and distributes multi-level
 *    referral commissions.
 */
const updateDepositStatus = async (req, res, next) => {
  try {
    const { status, adminMessage } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const deposit = await Deposit.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { status, adminMessage: adminMessage || '' },
      { new: true }
    );

    if (!deposit) {
      const exists = await Deposit.findById(req.params.id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Deposit not found' });
      }
      return res.status(400).json({ success: false, message: `Deposit is already ${exists.status}` });
    }

    if (status === 'Approved') {
      await User.updateOne({ _id: deposit.user }, { $inc: { totalBalance: deposit.amount } });

      await Transaction.updateOne(
        { referenceId: deposit._id, type: 'Deposit' },
        { status: 'Approved', description: `Deposit approved via ${deposit.paymentMethod}` }
      );

      await Notification.create({
        user: deposit.user,
        title: 'Deposit Approved',
        message: `Your deposit of PKR ${deposit.amount} has been approved and added to your balance.`,
        type: 'Deposit',
        isImportant: true,
      });

      // Multi-level referral commission on approved deposits
      await distributeReferralCommission(deposit.user, deposit.amount, 'deposit');
      await checkAndAwardReferralBonus(deposit.user, deposit.amount);

      // 🎁 AUTO GIFT BOX: If deposit is 50,000 or more, create a 2-hour locked Gift Box!
      if (deposit.amount >= 50000) {
        const unlocksAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

        // Check if gift box already created for this deposit to prevent duplicate
        const existingGift = await GiftBox.findOne({ depositId: deposit._id });
        if (!existingGift) {
          // Select default gift option or money reward for 50k+ deposit
          const giftTypes = ['Money', 'Motorcycle', 'Laptop', 'Phone'];
          const randomType = giftTypes[Math.floor(Math.random() * giftTypes.length)];
          
          let giftName = 'PKR 5,000 Special Cash Reward';
          let amount = 5000;

          if (randomType === 'Motorcycle') giftName = 'Honda CD 70 Motorcycle';
          else if (randomType === 'Laptop') giftName = 'HP Core i7 Laptop';
          else if (randomType === 'Phone') giftName = 'iPhone 15 Smart Phone';

          await GiftBox.create({
            user: deposit.user,
            depositId: deposit._id,
            title: `🎁 VIP 50K+ Deposit Gift Box`,
            giftType: randomType,
            giftName,
            amount: randomType === 'Money' ? amount : 0,
            description: `Reward for depositing PKR ${deposit.amount.toLocaleString()}. Unlocks in 2 hours!`,
            unlocksAt,
          });

          await Notification.create({
            user: deposit.user,
            title: '🎁 VIP Gift Box Received!',
            message: `Congratulations! Because your deposit is PKR ${deposit.amount.toLocaleString()}, you received a VIP Mystery Gift Box! It will unlock in 2 hours.`,
            type: 'Offer',
            isImportant: true,
          });
        }
      }
    } else {
      await Transaction.updateOne(
        { referenceId: deposit._id, type: 'Deposit' },
        { status: 'Rejected', description: `Deposit rejected` }
      );

      await Notification.create({
        user: deposit.user,
        title: 'Deposit Rejected',
        message: `Your deposit of PKR ${deposit.amount} was rejected. ${adminMessage || ''}`.trim(),
        type: 'Deposit',
        isImportant: true,
      });
    }

    res.json({ success: true, data: deposit, message: `Deposit ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};

export { createDeposit, getUserDeposits, getAllDeposits, updateDepositStatus };
