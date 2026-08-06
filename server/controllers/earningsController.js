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
    const earningsMatch = {
      user: user._id,
      isPositive: true,
      type: { $in: ['Profit', 'Referral Commission'] },
      status: { $in: ['Success', 'Approved'] },
    };
    const [earningsAgg] = await Transaction.aggregate([
      { $match: earningsMatch },
      {
        $facet: {
          today: [{ $match: { createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }],
          week: [{ $match: { createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }],
          month: [{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }],
          breakdown: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
          chart: [
            { $match: { createdAt: { $gte: weekStart } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
          ],
        },
      },
    ]);

    const totalEarnings = user.totalEarnings || 0;
    const todayEarnings = earningsAgg?.today[0]?.total || 0;
    const weeklyEarnings = earningsAgg?.week[0]?.total || 0;
    const monthlyEarnings = earningsAgg?.month[0]?.total || 0;
    const referralEarnings = user.referralEarnings || 0;

    // Build breakdown array
    let dailyProfitEarned = 0;
    let referralCommissionEarned = 0;

    (earningsAgg?.breakdown || []).forEach((item) => {
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
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTotal = earningsAgg?.chart.find((item) => item._id === dayKey)?.total || 0;

      weeklyChart.push({
        name: dayName,
        value: dayTotal,
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
