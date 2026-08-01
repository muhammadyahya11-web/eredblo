import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import Investment from '../models/Investment.js';

/**
 * Awards a referral bonus to the referrer whenever their referred user makes an investment.
 * - No minimum investment threshold — every investment amount earns a bonus.
 * - Bonus percentage and max cap are admin-configurable via Settings.
 */
export const checkAndAwardReferralBonus = async (userId, investedAmount, referenceId) => {
  if (!investedAmount || investedAmount <= 0) return;

  // The referral bonus is a one-time reward for the referred user's first investment.
  const previousInvestment = await Investment.exists({
    user: userId,
    ...(referenceId ? { _id: { $ne: referenceId } } : {}),
  });
  if (previousInvestment) return;

  const user = await User.findById(userId).select('referredBy name');
  if (!user || !user.referredBy) return;

  const referrer = await User.findById(user.referredBy).select('status name');
  if (!referrer || referrer.status !== 'active') return;

  const settings = await Settings.findOne();
  const bonusPercentage = settings?.referralBonusPercentage ?? 5;
  const bonusMax = settings?.referralBonusMax ?? 5000;

  const bonus = Math.min((investedAmount * bonusPercentage) / 100, bonusMax);
  const roundedBonus = Math.round(bonus * 100) / 100;

  if (roundedBonus <= 0) return;

  if (referenceId) {
    const existingBonus = await Transaction.exists({
      user: referrer._id,
      type: 'Referral Bonus',
      referenceId,
    });
    if (existingBonus) return;
  }

  await User.updateOne(
    { _id: referrer._id },
    { $inc: { totalBalance: roundedBonus, referralEarnings: roundedBonus, totalEarnings: roundedBonus } }
  );

  await Transaction.create({
    user: referrer._id,
    type: 'Referral Bonus',
    amount: roundedBonus,
    isPositive: true,
    status: 'Success',
    description: `Referral bonus (${bonusPercentage}%): ${user.name} invested PKR ${investedAmount.toLocaleString()}`,
    referenceId,
  });

  await Notification.create({
    user: referrer._id,
    title: 'Referral Bonus Earned!',
    message: `You earned PKR ${roundedBonus.toLocaleString()} referral bonus because ${user.name} invested PKR ${investedAmount.toLocaleString()}.`,
    type: 'Offer',
    isImportant: true,
  });
};
