import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

import { distributeProfits } from '../utils/profitEngine.js';
import { distributeReferralCommission } from '../utils/referralCommission.js';


// =====================================
// Create Investment
// =====================================

const createInvestment = async (req, res, next) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    if (plan.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This plan is not active',
      });
    }

    const amount = Number(plan.depositAmount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment amount',
      });
    }

    const dailyProfit = Number(plan.dailyProfit || 0);

    if (dailyProfit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid daily profit configured for this plan',
      });
    }

    const totalReturn =
      plan.totalReturn ??
      amount + dailyProfit * Number(plan.duration || 0);

    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        totalBalance: { $gte: amount },
      },
      {
        $inc: {
          totalBalance: -amount,
          totalInvestment: amount,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this investment',
      });
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setDate(
      endDate.getDate() + Number(plan.duration || 0)
    );

    let investment;

    try {
      investment = await Investment.create({
        user: user._id,
        plan: plan._id,
        amount,
        dailyProfit,
        totalReturn,
        startDate,
        endDate,
        status: 'active',

        // No instant profit
        profitEarned: 0,

        // First profit after 24 hours
        lastProfitAddedAt: startDate,
      });
    } catch (error) {
      await User.updateOne(
        { _id: user._id },
        {
          $inc: {
            totalBalance: amount,
            totalInvestment: -amount,
          },
        }
      );

      throw error;
    }

    await Transaction.create({
      user: user._id,
      type: 'Investment',
      amount,
      isPositive: false,
      status: 'Success',
      description: `Investment in ${plan.name}`,
      referenceId: investment._id,
    });

    await Notification.create({
      user: user._id,
      title: 'Investment Created',
      message: `Your investment of PKR ${amount.toLocaleString()} in ${plan.name} is now active.`,
      type: 'System',
      isImportant: true,
    });

    await distributeReferralCommission(
      user._id,
      amount,
      'investment',
      investment._id
    );

    res.status(201).json({
      success: true,
      data: investment,
      user: {
        totalBalance: user.totalBalance,
        totalInvestment: user.totalInvestment,
        totalEarnings: user.totalEarnings,
        todayEarnings: user.todayEarnings,
      },
      message: 'Investment created successfully',
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Get User Investments
// =====================================

const getUserInvestments = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const { status } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate(
          'plan',
          'name duration dailyProfit totalReturn'
        )
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      Investment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: investments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Get All Investments
// =====================================

const getAllInvestments = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const { status, userId } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.user = userId;
    }

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate('user', 'name email')
        .populate('plan', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      Investment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: investments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Get Investment By ID
// =====================================

const getInvestmentById = async (req, res, next) => {
  try {
    const investment = await Investment.findById(
      req.params.id
    ).populate(
      'plan',
      'name duration dailyProfit totalReturn'
    );

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    const isOwner =
      investment.user.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role === 'admin' ||
      req.user.role === 'super-admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Update Investment
// =====================================

const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findById(
      req.params.id
    );

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    const {
      dailyProfit,
      amount,
      duration,
      totalReturn,
      status,
    } = req.body;

    if (
      dailyProfit !== undefined &&
      !isNaN(Number(dailyProfit))
    ) {
      investment.dailyProfit = Number(dailyProfit);
    }

    if (
      amount !== undefined &&
      !isNaN(Number(amount))
    ) {
      investment.amount = Number(amount);
    }

    if (
      duration !== undefined &&
      !isNaN(Number(duration))
    ) {
      investment.duration = Number(duration);
    }

    if (
      totalReturn !== undefined &&
      !isNaN(Number(totalReturn))
    ) {
      investment.totalReturn = Number(totalReturn);
    }

    if (
      status !== undefined &&
      ['active', 'completed', 'cancelled'].includes(status)
    ) {
      investment.status = status;
    }

    await investment.save();

    res.json({
      success: true,
      message: 'Investment updated successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Manual Profit Distribution
// =====================================

const addProfitToInvestments = async (req, res, next) => {
  try {
    const result = await distributeProfits();

    res.json({
      success: true,
      message: 'Profit distribution completed successfully.',
      data: result || {},
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// Cancel Investment
// =====================================

const cancelInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findById(
      req.params.id
    ).populate('plan', 'name');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    if (
      investment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active investments can be cancelled',
      });
    }

    await User.updateOne(
      { _id: req.user._id },
      {
        $inc: {
          totalBalance: investment.amount,
          totalInvestment: -investment.amount,
        },
      }
    );

    investment.status = 'cancelled';

    await investment.save();

    await Transaction.create({
      user: req.user._id,
      type: 'Investment',
      amount: investment.amount,
      isPositive: true,
      status: 'Success',
      description: `Investment cancelled - ${
        investment.plan?.name || 'Plan'
      }`,
      referenceId: investment._id,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Investment Cancelled',
      message: `Your investment of PKR ${investment.amount.toLocaleString()} has been cancelled.`,
      type: 'System',
      isImportant: true,
    });

    res.json({
      success: true,
      message: 'Investment cancelled successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};


export {
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  getInvestmentById,
  updateInvestment,
  addProfitToInvestments,
  cancelInvestment,
};