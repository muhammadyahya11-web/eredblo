import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import Investment from '../models/Investment.js';

/**
 * Awards a referral bonus for a referred user's first successful investment only.
 * - An atomic processed marker prevents later or concurrent investments from paying again.
 * - Bonus percentage and max cap are admin-configurable via Settings.
 */
export const checkAndAwardReferralBonus = async (userId, investedAmount, referenceId) => {
  if (!investedAmount || investedAmount <= 0) return;

  if (!referenceId) return;

  const firstInvestment = await Investment.findOne({ user: userId })
    .sort({ createdAt: 1, _id: 1 })
    .select('_id');
  if (!firstInvestment || firstInvestment._id.toString() !== referenceId.toString()) return;

  const user = await User.findOneAndUpdate(
    { _id: userId, referredBy: { $ne: null }, referralBonusProcessedAt: null },
    { $set: { referralBonusProcessedAt: new Date(), referralBonusInvestment: referenceId } },
    { returnDocument: 'after' }
  ).select('referredBy name');
  if (!user) return;

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

  try {
    await Transaction.create({
      user: referrer._id,
      type: 'Referral Bonus',
      amount: roundedBonus,
      isPositive: true,
      status: 'Success',
      description: `Referral bonus (${bonusPercentage}%): ${user.name} invested PKR ${investedAmount.toLocaleString()}`,
      referenceId,
    });
  } catch (error) {
    if (error?.code === 11000) return;
    throw error;
  }

  await User.updateOne(
    { _id: referrer._id },
    { $inc: { totalBalance: roundedBonus, referralEarnings: roundedBonus, totalEarnings: roundedBonus } }
  );

  await User.updateOne(
    { _id: user._id, referralBonusInvestment: referenceId },
    { $set: { referralBonusPaidAt: new Date() } }
  );

  await Notification.create({
    user: referrer._id,
    title: 'Referral Bonus Earned!',
    message: `You earned PKR ${roundedBonus.toLocaleString()} referral bonus because ${user.name} invested PKR ${investedAmount.toLocaleString()}.`,
    type: 'Offer',
    isImportant: true,
  });
};
