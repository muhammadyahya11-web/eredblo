import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

const BONUS_PERCENTAGE = 5;
const MIN_BONUS = 500;
const MAX_BONUS = 5000;
const INVESTMENT_THRESHOLD = 100000;

export const checkAndAwardReferralBonus = async (userId) => {
  const user = await User.findById(userId).select('referredBy totalInvestment name');
  if (!user || !user.referredBy) return;

  const referrer = await User.findById(user.referredBy).select('status referralBonusesGiven');
  if (!referrer || referrer.status !== 'active') return;

  if (referrer.referralBonusesGiven?.includes(user._id)) return;

  const totalInvested = user.totalInvestment || 0;
  if (totalInvested < INVESTMENT_THRESHOLD) return;

  const bonus = Math.min(Math.max(totalInvested * (BONUS_PERCENTAGE / 100), MIN_BONUS), MAX_BONUS);
  const roundedBonus = Math.round(bonus * 100) / 100;

  await User.updateOne(
    { _id: referrer._id },
    { $push: { referralBonusesGiven: user._id }, $inc: { totalBalance: roundedBonus, referralEarnings: roundedBonus, totalEarnings: roundedBonus } }
  );

  await Transaction.create({
    user: referrer._id,
    type: 'Referral Bonus',
    amount: roundedBonus,
    isPositive: true,
    status: 'Success',
    description: `Referral bonus: ${user.name} invested over PKR ${INVESTMENT_THRESHOLD.toLocaleString()}`,
    referenceId: user._id,
  });

  await Notification.create({
    user: referrer._id,
    title: 'Referral Bonus Earned!',
    message: `Congratulations! You earned PKR ${roundedBonus.toLocaleString()} referral bonus because ${user.name} invested over PKR ${INVESTMENT_THRESHOLD.toLocaleString()}.`,
    type: 'Offer',
    isImportant: true,
  });
};
