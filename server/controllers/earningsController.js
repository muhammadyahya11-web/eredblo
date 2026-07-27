import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';

const getEarningsOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeInvestments = await Investment.find({ user: user._id, status: 'active' })
      .populate('plan', 'name dailyProfit totalReturn duration');

    const completedInvestments = await Investment.find({ user: user._id, status: 'completed' })
      .populate('plan', 'name');

    const todayAgg = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          isPositive: true,
          type: { $in: ['Profit', 'Referral Commission'] },
          status: { $in: ['Success', 'Approved'] },
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalEarnings = user.totalEarnings || 0;
    const todayEarnings = todayAgg[0]?.total || 0;
    const referralEarnings = user.referralEarnings || 0;

    const activeInvestmentEarnings = activeInvestments.reduce((sum, inv) => sum + (inv.profitEarned || 0), 0);

    res.json({
      success: true,
      data: {
        totalEarnings,
        todayEarnings,
        referralEarnings,
        activeInvestmentEarnings,
        activeInvestments,
        completedInvestments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformEarnings = async (req, res, next) => {
  try {
    const totalPlatformEarnings = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, totalEarnings: { $sum: '$totalEarnings' }, totalInvestment: { $sum: '$totalInvestment' }, totalWithdrawals: { $sum: '$totalWithdrawals' } } },
    ]);

    const platformData = totalPlatformEarnings[0] || { totalEarnings: 0, totalInvestment: 0, totalWithdrawals: 0 };

    const recentTransactions = await Transaction.find({ type: 'Profit' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: { ...platformData, recentTransactions } });
  } catch (error) {
    next(error);
  }
};

export { getEarningsOverview, getPlatformEarnings };
