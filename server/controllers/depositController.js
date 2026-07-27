import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import cloudinary from '../config/cloudinary.js';
import { distributeReferralCommission } from '../utils/referralCommission.js';
import { checkAndAwardReferralBonus } from '../utils/referralBonus.js';

const cloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

const resolveScreenshotUrl = async (file) => {
  if (!file) return '';
  // Upload to Cloudinary when configured; otherwise fall back to the locally
  // stored file so the flow works in development without cloud credentials.
  if (cloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ered-bloo/deposits',
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error.message);
    }
  }
  return `/uploads/${file.filename}`;
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
      await checkAndAwardReferralBonus(deposit.user);
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
