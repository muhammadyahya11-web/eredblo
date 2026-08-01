import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';

/**
 * Create a withdrawal request.
 *
 * Security / correctness:
 *  - Funds are HELD immediately: the amount is atomically deducted from the
 *    user's balance on request (conditional `$gte` update prevents race
 *    double-spend and negative balances).
 *  - If the request is later rejected, the held amount is refunded.
 *  - Only one pending withdrawal is allowed at a time.
 */
const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, paymentMethod, accountTitle, accountNumber } = req.body;
    const amt = parseFloat(amount);

    const settings = await Settings.findOne();
    const minWithdrawal = settings?.minimumWithdrawal ?? 300;
    const maxWithdrawal = settings?.maximumWithdrawal ?? 500000;
    const feePercentage = settings?.withdrawalFeePercentage ?? 3;
    const feeAmount = Math.round(((amt * feePercentage) / 100) * 100) / 100;
    const netAmount = Math.round((amt - feeAmount) * 100) / 100;

    if (amt < minWithdrawal) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is ${minWithdrawal}` });
    }
    if (amt > maxWithdrawal) {
      return res.status(400).json({ success: false, message: `Maximum withdrawal is ${maxWithdrawal}` });
    }
    if (netAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Withdrawal amount must be greater than the withdrawal fee' });
    }

    const pendingWithdrawal = await Withdrawal.findOne({ user: req.user._id, status: 'Pending' });
    if (pendingWithdrawal) {
      return res.status(400).json({ success: false, message: 'You already have a pending withdrawal request' });
    }

    // Atomically hold the funds (only if the balance is sufficient)
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, totalBalance: { $gte: amt } },
      { $inc: { totalBalance: -amt } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for this withdrawal' });
    }

    let withdrawal;
    try {
      withdrawal = await Withdrawal.create({
        user: req.user._id,
        amount: amt,
        feePercentage,
        feeAmount,
        netAmount,
        paymentMethod,
        accountTitle,
        accountNumber,
        status: 'Pending',
      });
    } catch (err) {
      // Refund the held funds if the request could not be persisted
      await User.updateOne({ _id: req.user._id }, { $inc: { totalBalance: amt } });
      throw err;
    }

    await Transaction.create({
      user: req.user._id,
      type: 'Withdrawal',
      amount: amt,
      isPositive: false,
      status: 'Pending',
      description: `Withdrawal request via ${paymentMethod} (fee PKR ${feeAmount}, payout PKR ${netAmount})`,
      referenceId: withdrawal._id,
    });

    res.status(201).json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request submitted. Awaiting admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

const getUserWithdrawals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(filter);

    res.json({ success: true, data: withdrawals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getAllWithdrawals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.query.userId) filter.user = req.query.userId;

    const withdrawals = await Withdrawal.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(filter);

    res.json({ success: true, data: withdrawals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject a withdrawal.
 *  - Approve: funds were already held at request time, so we only mark the
 *    ledger settled and increment lifetime `totalWithdrawals`.
 *  - Reject: refund the held amount back to the user's balance.
 * Uses a status-guarded atomic transition to prevent double processing.
 */
const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, adminMessage } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    // Atomic guard: transition only if still Pending (prevents double handling)
    const withdrawal = await Withdrawal.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { status, adminMessage: adminMessage || '' },
      { new: true }
    );

    if (!withdrawal) {
      const exists = await Withdrawal.findById(req.params.id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Withdrawal not found' });
      }
      return res.status(400).json({ success: false, message: `Withdrawal is already ${exists.status}` });
    }

    if (status === 'Approved') {
      const netAmount = withdrawal.netAmount ?? Math.round(
        withdrawal.amount * (1 - (withdrawal.feePercentage ?? 3) / 100) * 100
      ) / 100;
      const feeAmount = withdrawal.feeAmount ?? Math.round((withdrawal.amount - netAmount) * 100) / 100;
      await User.updateOne({ _id: withdrawal.user }, { $inc: { totalWithdrawals: netAmount } });

      await Transaction.updateOne(
        { referenceId: withdrawal._id, type: 'Withdrawal' },
        { status: 'Approved', description: `Withdrawal approved via ${withdrawal.paymentMethod} (payout PKR ${netAmount}, fee PKR ${feeAmount})` }
      );

      await Notification.create({
        user: withdrawal.user,
        title: 'Withdrawal Approved',
        message: `Your withdrawal of PKR ${netAmount} has been approved after a PKR ${feeAmount} fee.`,
        type: 'Withdrawal',
        isImportant: true,
      });
    } else {
      // Refund the previously held funds
      await User.updateOne({ _id: withdrawal.user }, { $inc: { totalBalance: withdrawal.amount } });

      await Transaction.updateOne(
        { referenceId: withdrawal._id, type: 'Withdrawal' },
        { status: 'Rejected', description: `Withdrawal rejected - amount refunded` }
      );

      await Notification.create({
        user: withdrawal.user,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of PKR ${withdrawal.amount} was rejected and refunded to your balance. ${adminMessage || ''}`.trim(),
        type: 'Withdrawal',
        isImportant: true,
      });
    }

    res.json({ success: true, data: withdrawal, message: `Withdrawal ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};

export { createWithdrawal, getUserWithdrawals, getAllWithdrawals, updateWithdrawalStatus };
