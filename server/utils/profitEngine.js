import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

let schedulerInterval = null;

const distributeProfits = async () => {
  try {
    const activeInvestments = await Investment.find({ status: 'active' })
      .populate('plan')
      .populate('user');

    const now = new Date();
    let updatedCount = 0;

    for (const investment of activeInvestments) {
      try {
        if (now >= investment.endDate) {
          investment.status = 'completed';

          const user = await User.findById(investment.user._id);
          if (user) {
            const profit = investment.totalReturn - investment.amount;
            user.totalBalance = (user.totalBalance || 0) + investment.totalReturn;
            user.totalEarnings = (user.totalEarnings || 0) + profit;
            user.todayEarnings = (user.todayEarnings || 0) + profit;
            await user.save();

            await Transaction.create({
              user: user._id,
              type: 'Profit',
              amount: profit,
              isPositive: true,
              status: 'Approved',
              description: `Investment matured - ${investment.plan?.name || 'Plan'}`,
              referenceId: investment._id,
            });

            await Notification.create({
              user: user._id,
              title: 'Investment Matured',
              message: `Your investment of ${investment.amount} has matured. You earned PKR ${profit.toLocaleString()} profit.`,
              type: 'Profit',
              isImportant: true,
            });
          }

          await investment.save();
          updatedCount++;
          continue;
        }

        const lastAdded = investment.lastProfitAddedAt || investment.startDate;
        const hoursSinceLastProfit = (now - new Date(lastAdded)) / (1000 * 60 * 60);

        if (hoursSinceLastProfit >= 24) {
          const daysToAdd = Math.floor(hoursSinceLastProfit / 24);
          const profitToAdd = investment.dailyProfit * daysToAdd;

          investment.profitEarned = (investment.profitEarned || 0) + profitToAdd;
          investment.lastProfitAddedAt = new Date(new Date(lastAdded).getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          const user = await User.findById(investment.user._id);
          if (user) {
            user.todayEarnings = (user.todayEarnings || 0) + profitToAdd;
            user.totalEarnings = (user.totalEarnings || 0) + profitToAdd;
            user.totalBalance = (user.totalBalance || 0) + profitToAdd;
            await user.save();

            await Transaction.create({
              user: investment.user._id,
              type: 'Profit',
              amount: profitToAdd,
              isPositive: true,
              status: 'Approved',
              description: `Daily profit - ${investment.plan?.name || 'Investment'}`,
              referenceId: investment._id,
            });

            await Notification.create({
              user: investment.user._id,
              title: 'Daily Profit Added',
              message: `You received PKR ${profitToAdd.toLocaleString()} as daily profit from your investment.`,
              type: 'Profit',
              isImportant: false,
            });
          }

          await investment.save();
          updatedCount++;
        }
      } catch (investmentError) {
        console.error(`Error processing investment ${investment._id}:`, investmentError.message);
      }
    }

    if (updatedCount > 0) {
      console.log(`[ProfitEngine] Updated ${updatedCount} investments at ${now.toISOString()}`);
    }
  } catch (error) {
    console.error('[ProfitEngine] Error distributing profits:', error.message);
  }
};

const startProfitScheduler = () => {
  console.log('[ProfitEngine] Starting profit distribution scheduler...');
  distributeProfits();
  schedulerInterval = setInterval(distributeProfits, 60 * 60 * 1000);
};

const stopProfitScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

process.on('SIGINT', () => {
  stopProfitScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopProfitScheduler();
  process.exit(0);
});

export { distributeProfits, startProfitScheduler, stopProfitScheduler };
