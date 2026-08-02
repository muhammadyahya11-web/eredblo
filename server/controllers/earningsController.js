import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';

const getEarningsOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeInvestments = await Investment.find({ user: user._id, status: 'active' })
      .populate('plan', 'name dailyProfit totalReturn duration');

    const completedInvestments = await Investment.find({ user: user._id, status: 'completed' })
      .populate('plan', 'name');

    // Aggregate today, weekly, and monthly earnings
    const [todayAgg, weekAgg, monthAgg, typeBreakdownAgg] = await Promise.all([
      Transaction.aggregate([
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
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            isPositive: true,
            type: { $in: ['Profit', 'Referral Commission'] },
            status: { $in: ['Success', 'Approved'] },
            createdAt: { $gte: weekStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            isPositive: true,
            type: { $in: ['Profit', 'Referral Commission'] },
            status: { $in: ['Success', 'Approved'] },
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            isPositive: true,
            type: { $in: ['Profit', 'Referral Commission'] },
            status: { $in: ['Success', 'Approved'] },
          },
        },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalEarnings = user.totalEarnings || 0;
    const todayEarnings = todayAgg[0]?.total || 0;
    const weeklyEarnings = weekAgg[0]?.total || 0;
    const monthlyEarnings = monthAgg[0]?.total || 0;
    const referralEarnings = user.referralEarnings || 0;

    // Build breakdown array
    let dailyProfitEarned = 0;
    let referralCommissionEarned = 0;

    typeBreakdownAgg.forEach((item) => {
      if (item._id === 'Profit') dailyProfitEarned = item.total;
      if (item._id === 'Referral Commission') referralCommissionEarned = item.total;
    });

    const breakdown = [
      { name: 'Daily Profit', value: dailyProfitEarned, color: '#3b82f6' },
      { name: 'Referral Commission', value: referralCommissionEarned, color: '#8b5cf6' },
    ];

    // Build 7-day chart points
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayAgg = await Transaction.aggregate([
        {
          $match: {
            user: user._id,
            isPositive: true,
            type: { $in: ['Profit', 'Referral Commission'] },
            status: { $in: ['Success', 'Approved'] },
            createdAt: { $gte: dayStart, $lte: dayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      weeklyChart.push({
        name: dayName,
        value: dayAgg[0]?.total || 0,
      });
    }

    const activeInvestmentEarnings = activeInvestments.reduce((sum, inv) => sum + (inv.profitEarned || 0), 0);

    res.json({
      success: true,
      data: {
        totalEarnings,
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        referralEarnings,
        activeInvestmentEarnings,
        breakdown,
        weeklyChart,
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
