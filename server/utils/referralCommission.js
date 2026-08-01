import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Investment from '../models/Investment.js';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Distribute multi-level referral commission up the referrer chain.
 *
 * Walks up to 3 levels of `referredBy` and credits each upline referrer a
 * percentage of `baseAmount` based on Settings.referralCommissionRates.
 * Credits are atomic (`$inc`) and only paid to active (non-blocked) accounts.
 *
 * NOTE: Referral commission is awarded ONLY on the referred user's FIRST plan investment.
 *
 * @param {ObjectId|string} userId  The user whose action triggered commissions.
 * @param {number} baseAmount       The amount commissions are calculated from.
 * @param {string} reason           Short description for the ledger.
 * @param {ObjectId|string} referenceId The investment ObjectId.
 */
export const distributeReferralCommission = async (userId, baseAmount, reason = 'investment', referenceId) => {
  if (!baseAmount || baseAmount <= 0) return;

  // Referral commission is awarded ONLY on the user's first plan investment
  if (referenceId) {
    const firstInvestment = await Investment.findOne({ user: userId })
      .sort({ createdAt: 1, _id: 1 })
      .select('_id');
    if (!firstInvestment || firstInvestment._id.toString() !== referenceId.toString()) {
      return;
    }
  } else {
    const hasInvestments = await Investment.exists({ user: userId });
    if (hasInvestments) {
      const count = await Investment.countDocuments({ user: userId });
      if (count > 1) return;
    }
  }

  const settings = await Settings.findOne();
  const rates = [
    settings?.referralCommissionRates?.level1 ?? 10,
    settings?.referralCommissionRates?.level2 ?? 5,
    settings?.referralCommissionRates?.level3 ?? 2,
  ];

  let current = await User.findById(userId).select('referredBy');

  for (let level = 0; level < rates.length; level++) {
    if (!current || !current.referredBy) break;

    const referrer = await User.findById(current.referredBy).select('referredBy status name');
    if (!referrer) break;

    const rate = rates[level] || 0;
    if (rate > 0 && referrer.status === 'active') {
      const commission = round2((baseAmount * rate) / 100);
      if (commission > 0) {
        const description = `Level ${level + 1} referral commission (${reason})`;
        const existingCommission = referenceId
          ? await Transaction.exists({
              user: referrer._id,
              type: 'Referral Commission',
              referenceId,
              description,
            })
          : null;
        if (existingCommission) {
          current = referrer;
          continue;
        }

        try {
          await Transaction.create({
            user: referrer._id,
            type: 'Referral Commission',
            amount: commission,
            isPositive: true,
            status: 'Success',
            description,
            referenceId,
          });
        } catch (error) {
          if (error?.code === 11000) {
            current = referrer;
            continue;
          }
          throw error;
        }

        await User.updateOne(
          { _id: referrer._id },
          { $inc: { totalBalance: commission, referralEarnings: commission, totalEarnings: commission } }
        );

        await Notification.create({
          user: referrer._id,
          title: 'Referral Commission Earned',
          message: `You earned PKR ${commission} (Level ${level + 1}) referral commission from ${reason === 'investment' ? 'an investment' : `a ${reason}`}.`,
          type: 'Offer',
          isImportant: false,
        });
      }
    }

    current = referrer;
  }
};
