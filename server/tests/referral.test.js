import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { connectTestDB, closeTestDB, clearTestDB } from './db.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Transaction from '../models/Transaction.js';
import Investment from '../models/Investment.js';
import { distributeReferralCommission } from '../utils/referralCommission.js';
import { checkAndAwardReferralBonus } from '../utils/referralBonus.js';

jest.setTimeout(30000);

const createUser = (name, referredBy) => User.create({
  name,
  email: `${name.toLowerCase()}@example.com`,
  password: 'Password123!',
  phone: `0300000000${name.length}`,
  referredBy,
});

const createInvestment = (user, amount = 10000) => Investment.create({
  user: user._id,
  plan: new mongoose.Types.ObjectId(),
  amount,
  dailyProfit: 100,
  totalReturn: amount + 1000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  status: 'active',
});

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Referral payouts', () => {
  it('pays configured commissions to three active uplines on first plan investment', async () => {
    await Settings.create({ referralCommissionRates: { level1: 10, level2: 5, level3: 2 } });
    const level3 = await createUser('LevelThree');
    const level2 = await createUser('LevelTwo', level3._id);
    const level1 = await createUser('LevelOne', level2._id);
    const referredUser = await createUser('Referred', level1._id);
    const investment = await createInvestment(referredUser, 10000);

    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment._id);

    const [updatedLevel1, updatedLevel2, updatedLevel3] = await Promise.all([
      User.findById(level1._id),
      User.findById(level2._id),
      User.findById(level3._id),
    ]);
    expect(updatedLevel1.totalBalance).toBe(1000);
    expect(updatedLevel2.totalBalance).toBe(500);
    expect(updatedLevel3.totalBalance).toBe(200);
    expect(await Transaction.countDocuments({ type: 'Referral Commission', referenceId: investment._id })).toBe(3);
  });

  it('does not pay referral commission on second or subsequent plan investments', async () => {
    await Settings.create({ referralCommissionRates: { level1: 10, level2: 5, level3: 2 } });
    const referrer = await createUser('Referrer');
    const referredUser = await createUser('Referred', referrer._id);
    
    // First investment
    const investment1 = await createInvestment(referredUser, 10000);
    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment1._id);

    // Second investment
    const investment2 = await createInvestment(referredUser, 10000);
    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment2._id);

    const updatedReferrer = await User.findById(referrer._id);
    expect(updatedReferrer.totalBalance).toBe(1000); // Only 1000 from 1st investment
    expect(await Transaction.countDocuments({ type: 'Referral Commission' })).toBe(1);
  });

  it('does not pay the same investment commission twice', async () => {
    const referrer = await createUser('Referrer');
    const referredUser = await createUser('Referred', referrer._id);
    const investment = await createInvestment(referredUser, 10000);

    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment._id);
    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment._id);

    const updatedReferrer = await User.findById(referrer._id);
    expect(updatedReferrer.totalBalance).toBe(1000);
    expect(await Transaction.countDocuments({ type: 'Referral Commission', referenceId: investment._id })).toBe(1);
  });

  it('awards one capped direct referral bonus per first investment', async () => {
    await Settings.create({ referralBonusPercentage: 5, referralBonusMax: 5000 });
    const referrer = await createUser('Referrer');
    const referredUser = await createUser('Referred', referrer._id);
    const investment = await createInvestment(referredUser, 200000);

    await checkAndAwardReferralBonus(referredUser._id, 200000, investment._id);
    await checkAndAwardReferralBonus(referredUser._id, 200000, investment._id);

    const updatedReferrer = await User.findById(referrer._id);
    expect(updatedReferrer.totalBalance).toBe(5000);
    expect(updatedReferrer.referralEarnings).toBe(5000);
    expect(await Transaction.countDocuments({ type: 'Referral Bonus', referenceId: investment._id })).toBe(1);
    const markedUser = await User.findById(referredUser._id);
    expect(markedUser.referralBonusPaidAt).not.toBeNull();
    expect(markedUser.referralBonusInvestment.toString()).toBe(investment._id.toString());
  });

  it('does not award a bonus when the referred user already invested', async () => {
    await Settings.create({ referralBonusPercentage: 5, referralBonusMax: 5000 });
    const referrer = await createUser('Referrer');
    const referredUser = await createUser('Referred', referrer._id);
    await createInvestment(referredUser);
    const laterInvestment = await createInvestment(referredUser, 20000);

    await checkAndAwardReferralBonus(referredUser._id, 20000, laterInvestment._id);

    const updatedReferrer = await User.findById(referrer._id);
    expect(updatedReferrer.totalBalance).toBe(0);
    expect(await Transaction.countDocuments({ type: 'Referral Bonus' })).toBe(0);
  });

  it('skips blocked referrers', async () => {
    const referrer = await createUser('Referrer');
    referrer.status = 'blocked';
    await referrer.save();
    const referredUser = await createUser('Referred', referrer._id);
    const investment = await createInvestment(referredUser, 10000);

    await distributeReferralCommission(referredUser._id, 10000, 'investment', investment._id);
    await checkAndAwardReferralBonus(referredUser._id, 10000, investment._id);

    const updatedReferrer = await User.findById(referrer._id);
    expect(updatedReferrer.totalBalance).toBe(0);
    expect(await Transaction.countDocuments({ user: referrer._id })).toBe(0);
  });
});
