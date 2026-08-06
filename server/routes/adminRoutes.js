import express from 'express';
import {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  getAdmins,
  createAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { adminSendGift, getAllGifts as getAllGiftBoxes, deleteGift } from '../controllers/giftController.js';
import { protect, admin, superAdmin } from '../middlewares/authMiddleware.js';
import { validateCreateAdmin } from '../middlewares/validation.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Investment from '../models/Investment.js';

const router = express.Router();

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.put('/users/:id', protect, superAdmin, updateUser);
router.delete('/users/:id', protect, superAdmin, deleteUser);

router.get('/admins', protect, superAdmin, getAdmins);
router.post('/admins', protect, superAdmin, validateCreateAdmin, createAdmin);
router.delete('/admins/:id', protect, superAdmin, deleteAdmin);

// Gift Box Admin aliases
router.post('/gifts/send', protect, admin, adminSendGift);
router.get('/gifts/all', protect, admin, getAllGiftBoxes);
router.delete('/gifts/:id', protect, admin, deleteGift);

// ── Referral Tree ─────────────────────────────────────────────────
router.get('/referral-tree/:userId', protect, superAdmin, async (req, res) => {
  try {
    const buildTree = async (userId, depth = 0) => {
      if (depth > 5) return []; // max 6 levels deep
      const children = await User.find({ referredBy: userId })
        .select('name email referralCode totalInvestment totalEarnings totalBalance status createdAt')
        .lean();
      const result = [];
      for (const child of children) {
        const grandchildren = await buildTree(child._id, depth + 1);
        result.push({ ...child, children: grandchildren });
      }
      return result;
    };

    const root = await User.findById(req.params.userId)
      .select('name email referralCode totalInvestment totalEarnings totalBalance status createdAt')
      .lean();
    if (!root) return res.status(404).json({ success: false, message: 'User not found' });

    root.children = await buildTree(root._id);
    res.json({ success: true, data: root });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Leader Management ─────────────────────────────────────────────
router.get('/leaders', protect, superAdmin, async (req, res) => {
  try {
    const leaders = await User.find({ isLeader: true })
      .select('name email phone referralCode totalInvestment totalEarnings totalBalance status createdAt')
      .sort('-totalInvestment');
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leaders/:id/promote', protect, superAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isLeader: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `${user.name} promoted to leader`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leaders/:id/demote', protect, superAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isLeader: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `${user.name} demoted from leader`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ROI / Wallet Overview ─────────────────────────────────────────
router.get('/wallet-overview', protect, superAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [userAgg, depositAgg, withdrawalAgg, investmentAgg, profitAgg, monthlyDeposits, monthlyWithdrawals] = await Promise.all([
      User.aggregate([{ $group: { _id: null, totalBalance: { $sum: '$totalBalance' }, totalEarnings: { $sum: '$totalEarnings' }, totalWithdrawals: { $sum: '$totalWithdrawals' } } }]),
      Transaction.aggregate([{ $match: { type: 'Deposit', status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'Withdrawal', status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'Investment' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'Profit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([
        { $match: { type: 'Deposit', status: 'Approved', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'Withdrawal', status: 'Approved', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } }
      ]),
    ]);

    // Build the 6-month chart data
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      const dep = monthlyDeposits.find(x => x._id === monthKey)?.total || 0;
      const wdl = monthlyWithdrawals.find(x => x._id === monthKey)?.total || 0;

      chartData.push({ month: monthName, deposits: dep, withdrawals: wdl });
    }

    res.json({
      success: true,
      data: {
        totalUserBalances: userAgg[0]?.totalBalance || 0,
        totalUserEarnings: userAgg[0]?.totalEarnings || 0,
        totalUserWithdrawals: userAgg[0]?.totalWithdrawals || 0,
        totalDeposited: depositAgg[0]?.total || 0,
        totalWithdrawn: withdrawalAgg[0]?.total || 0,
        totalInvested: investmentAgg[0]?.total || 0,
        totalProfitDistributed: profitAgg[0]?.total || 0,
        netBalance: (depositAgg[0]?.total || 0) - (withdrawalAgg[0]?.total || 0),
        chartData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Reports ───────────────────────────────────────────────────────
router.get('/reports', protect, superAdmin, async (req, res) => {
  try {
    const { type = 'daily', from, to, dataType = 'deposits' } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();
    endDate.setHours(23, 59, 59, 999);

    let txnType;
    if (dataType === 'deposits') txnType = 'Deposit';
    else if (dataType === 'withdrawals') txnType = 'Withdrawal';
    else if (dataType === 'profits') txnType = 'Profit';
    else if (dataType === 'investments') txnType = 'Investment';

    const matchStage = { createdAt: { $gte: startDate, $lte: endDate } };
    if (txnType) matchStage.type = txnType;

    const groupFormat = type === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

    const data = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: { transactions: data, registrations: userRegistrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Dashboard Summary (all data in one call) ──────────────────────
router.get('/dashboard-summary', protect, superAdmin, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const sevenDaysAgoPrev = new Date(sevenDaysAgo);
    sevenDaysAgoPrev.setDate(sevenDaysAgoPrev.getDate() - 7);

    // Run all aggregations in parallel
    const [
      userStats,
      newUsersThisWeek,
      newUsersPrevWeek,
      depositAgg,
      withdrawalAgg,
      pendingWithdrawal,
      profitAgg,
      depositChart,
      withdrawalChart,
      registrationChart,
      topInvestors,
      depositMethods,
      recentTxns,
      recentUsers,
    ] = await Promise.all([
      // User KPIs
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
            activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalBalance: { $sum: '$totalBalance' },
            totalEarnings: { $sum: '$totalEarnings' },
            totalWithdrawals: { $sum: '$totalWithdrawals' },
            totalInvestment: { $sum: '$totalInvestment' },
          },
        },
      ]),
      User.countDocuments({ role: 'user', createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: sevenDaysAgoPrev, $lt: sevenDaysAgo } }),

      // Total deposits (Approved)
      Transaction.aggregate([{ $match: { type: 'Deposit', status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      // Total withdrawals (Approved)
      Transaction.aggregate([{ $match: { type: 'Withdrawal', status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      // Pending withdrawals
      Transaction.aggregate([{ $match: { type: 'Withdrawal', status: 'Pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      // Today's profit
      Transaction.aggregate([
        { $match: { type: 'Profit', status: { $in: ['Approved', 'Success'] }, createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Deposit chart data (last 7 days)
      Transaction.aggregate([
        { $match: { type: 'Deposit', status: 'Approved', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      // Withdrawal chart data (last 7 days)
      Transaction.aggregate([
        { $match: { type: 'Withdrawal', status: 'Approved', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      // Registration chart data (last 7 days)
      User.aggregate([
        { $match: { role: 'user', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 investors
      User.find({ role: 'user' })
        .sort({ totalInvestment: -1 })
        .limit(5)
        .select('name email totalInvestment totalEarnings totalWithdrawals')
        .lean(),

      // Deposit method breakdown (from Deposit model)
      (async () => {
        try {
          const Deposit = (await import('../models/Deposit.js')).default;
          return await Deposit.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ]);
        } catch { return []; }
      })(),

      // Recent 5 transactions
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),

      // Recent 10 registered users
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email phone status createdAt isVerified referralCode totalBalance totalInvestment totalEarnings')
        .lean(),
    ]);

    const stats = userStats[0] || {};

    // Build 7-day chart arrays
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const depositChartMap = Object.fromEntries(depositChart.map(d => [d._id, d.total]));
    const withdrawalChartMap = Object.fromEntries(withdrawalChart.map(d => [d._id, d.total]));
    const registrationChartMap = Object.fromEntries(registrationChart.map(d => [d._id, d.count]));

    const chartData = days.map(day => {
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        name: label,
        deposit: depositChartMap[day] || 0,
        withdrawal: withdrawalChartMap[day] || 0,
        users: registrationChartMap[day] || 0,
      };
    });

    // Compute deposit method percentages
    const totalDepositedByMethod = depositMethods.reduce((s, m) => s + m.total, 0);
    const depositMethodBreakdown = depositMethods.map(m => ({
      name: m._id || 'Unknown',
      value: totalDepositedByMethod > 0 ? parseFloat(((m.total / totalDepositedByMethod) * 100).toFixed(1)) : 0,
      amount: m.total,
      count: m.count,
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          totalUsers: stats.totalUsers || 0,
          activeUsers: stats.activeUsers || 0,
          newRegistrations: newUsersThisWeek || 0,
          newRegistrationsPrev: newUsersPrevWeek || 0,
          totalDeposits: depositAgg[0]?.total || 0,
          totalWithdrawals: withdrawalAgg[0]?.total || 0,
          pendingWithdrawals: pendingWithdrawal[0]?.total || 0,
          todaysProfit: profitAgg[0]?.total || 0,
          companyBalance: stats.totalBalance || 0,
          totalRevenue: (depositAgg[0]?.total || 0) - (withdrawalAgg[0]?.total || 0),
          totalROIPaid: profitAgg[0]?.total || 0,
          totalProfit: (depositAgg[0]?.total || 0) - (withdrawalAgg[0]?.total || 0) - (stats.totalBalance || 0),
        },
        chartData,
        topInvestors: topInvestors.map((u, i) => ({
          id: i + 1,
          username: u.name || u.email,
          invest: u.totalInvestment || 0,
          roi: u.totalEarnings || 0,
          withdrawal: u.totalWithdrawals || 0,
        })),
        depositMethods: depositMethodBreakdown,
        recentTransactions: recentTxns,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

