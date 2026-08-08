import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
// -------------------------------------------------------------------------
let schedulerInterval = null;

const distributeProfits = async () => {
  try {
    const activeInvestments = await Investment.find({
      status: 'active',
    }).populate('plan', 'name');

    const now = new Date();
    let updatedCount = 0;

    for (const investment of activeInvestments) {
      try {
        const userId = investment.user;

        if (!userId) {
          console.warn(
            `[ProfitEngine] Missing user for investment ${investment._id}`
          );
          continue;
        }

        if (investment.endDate && now >= new Date(investment.endDate)) {
          investment.status = 'completed';

          const user = await User.findById(userId);

          if (user) {
            const totalProfit = Math.max(
              0,
              (investment.totalReturn || 0) - (investment.amount || 0)
            );

            const profitEarned = investment.profitEarned || 0;

            const remainingProfit = Math.max(
              0,
              totalProfit - profitEarned
            );

            const maturityAmount =
              (investment.amount || 0) + remainingProfit;

            user.totalBalance =
              (user.totalBalance || 0) + maturityAmount;

            user.totalEarnings =
              (user.totalEarnings || 0) + remainingProfit;

            await user.save();

            await Transaction.create({
              user: user._id,
              type: 'Profit',
              amount: maturityAmount,
              isPositive: true,
              status: 'Approved',
              description: `Investment matured - ${
                investment.plan?.name || 'Plan'
              }`,
              referenceId: investment._id,
            });

            await Notification.create({
              user: user._id,
              title: 'Investment Matured',
              message: `Investment completed. PKR ${maturityAmount.toLocaleString()} added.`,
              type: 'Profit',
              isImportant: true,
            });

            console.log(
              `[ProfitEngine] Investment ${investment._id} matured. Amount: ${maturityAmount}`
            );
          }

          await investment.save();
          updatedCount++;
          continue;
        }

        const lastAdded =
          investment.lastProfitAddedAt || investment.startDate;

        if (!lastAdded) {
          console.warn(
            `[ProfitEngine] Missing start date for investment ${investment._id}`
          );
          continue;
        }

        const hoursSinceLastProfit =
          (now.getTime() - new Date(lastAdded).getTime()) /
          (1000 * 60 * 60);


          // --------------------------------------------------------------

        if (hoursSinceLastProfit < 24) {
          continue;
        }

        const missedDays = Math.floor(hoursSinceLastProfit / 24);
        const dailyProfit = Number(investment.dailyProfit || 0);

        if (dailyProfit <= 0) {
          console.warn(
            `[ProfitEngine] Invalid dailyProfit for investment ${investment._id}`
          );
          continue;
        }

        const profitToAdd = dailyProfit * missedDays;

        investment.profitEarned =
          (investment.profitEarned || 0) + profitToAdd;

        investment.lastProfitAddedAt = new Date(
          new Date(lastAdded).getTime() +
            missedDays * 24 * 60 * 60 * 1000
        );

        const user = await User.findById(userId);

        if (!user) {
          console.warn(
            `[ProfitEngine] User not found for investment ${investment._id}`
          );
          continue;
        }

        user.totalBalance =
          (user.totalBalance || 0) + profitToAdd;

        user.totalEarnings =
          (user.totalEarnings || 0) + profitToAdd;

        user.todayEarnings =
          (user.todayEarnings || 0) + profitToAdd;

        await user.save();

        await Transaction.create({
          user: user._id,
          type: 'Profit',
          amount: profitToAdd,
          isPositive: true,
          status: 'Approved',
          description: `Daily investment profit - ${
            investment.plan?.name || 'Investment'
          }`,
          referenceId: investment._id,
        });

        await Notification.create({
          user: user._id,
          title: 'Profit Added',
          message: `PKR ${profitToAdd.toLocaleString()} profit added.`,
          type: 'Profit',
          isImportant: false,
        });

        await investment.save();

        updatedCount++;

        console.log(
          `[ProfitEngine] ${profitToAdd} profit added to user ${user._id} for ${missedDays} day(s)`
        );
      } catch (error) {
        console.error(
          `[ProfitEngine] Investment ${investment._id} error:`,
          error.message
        );
      }
    }

    if (updatedCount > 0) {
      console.log(
        `[ProfitEngine] Updated ${updatedCount} investment(s)`
      );
    }

    return {
      updatedCount,
      processedAt: now.toISOString(),
    };
  } catch (error) {
    console.error(
      '[ProfitEngine] Distribution error:',
      error.message
    );

    return {
      updatedCount: 0,
      error: error.message,
    };
  }
};

const startProfitScheduler = () => {
  if (schedulerInterval) {
    console.log('[ProfitEngine] Scheduler already running');
    return;
  }

  console.log('[ProfitEngine] 24-hour profit scheduler started');

  distributeProfits();

  schedulerInterval = setInterval(
    distributeProfits,
    10 * 1000
  );
};

const stopProfitScheduler = () => {
  if (!schedulerInterval) {
    return;
  }

  clearInterval(schedulerInterval);
  schedulerInterval = null;

  console.log('[ProfitEngine] Scheduler stopped');
};

process.on('SIGINT', () => {
  stopProfitScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopProfitScheduler();
  process.exit(0);
});

export {
  distributeProfits,
  startProfitScheduler,
  stopProfitScheduler,
};