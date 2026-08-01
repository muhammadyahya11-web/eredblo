import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Distribute multi-level referral commission up the referrer chain.
 *
 * Walks up to 3 levels of `referredBy` and credits each upline referrer a
 * percentage of `baseAmount` based on Settings.referralCommissionRates.
 * Credits are atomic (`$inc`) and only paid to active (non-blocked) accounts.
 *
 * @param {ObjectId|string} userId  The user whose action triggered commissions.
 * @param {number} baseAmount       The amount commissions are calculated from.
 * @param {string} reason           Short description for the ledger.
 */
export const distributeReferralCommission = async (userId, baseAmount, reason = 'deposit', referenceId) => {
  if (!baseAmount || baseAmount <= 0) return;

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

        await User.updateOne(
          { _id: referrer._id },
          { $inc: { totalBalance: commission, referralEarnings: commission, totalEarnings: commission } }
        );

        await Transaction.create({
          user: referrer._id,
          type: 'Referral Commission',
          amount: commission,
          isPositive: true,
          status: 'Success',
          description,
          referenceId,
        });

        await Notification.create({
          user: referrer._id,
          title: 'Referral Commission Earned',
          message: `You earned PKR ${commission} (Level ${level + 1}) referral commission from a ${reason}.`,
          type: 'Offer',
          isImportant: false,
        });
      }
    }

    current = referrer;
  }
};
