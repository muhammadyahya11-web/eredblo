import request from 'supertest';
import app from '../server.js';
import { connectTestDB, closeTestDB, clearTestDB } from './db.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import generateToken from '../utils/generateToken.js';
import { distributeProfits } from '../utils/profitEngine.js';

const createUserAndPlan = async () => {
  const user = await User.create({
    name: 'Investor',
    email: 'investor@example.com',
    password: 'Password123!',
    phone: '03001234567',
    totalBalance: 10000,
  });
  const plan = await Plan.create({
    name: 'Starter',
    depositAmount: 5000,
    dailyProfit: 250,
    duration: 10,
    totalReturn: 7500,
    status: 'active',
  });
  return { user, plan };
};

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Investment daily profit', () => {
  it('credits the first daily profit when a plan becomes active', async () => {
    const { user, plan } = await createUserAndPlan();

    const response = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ planId: plan._id.toString() });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.totalBalance).toBe(5250);
    expect(response.body.user.totalEarnings).toBe(250);
    expect(response.body.data.profitEarned).toBe(250);
    expect(await Transaction.countDocuments({ user: user._id, type: 'Profit', referenceId: response.body.data._id })).toBe(1);
    expect((await Investment.findById(response.body.data._id)).status).toBe('active');
  });

  it('credits the next daily profit after a complete 24-hour period', async () => {
    const { user, plan } = await createUserAndPlan();
    const activation = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ planId: plan._id.toString() });
    const investmentId = activation.body.data._id;

    await Investment.updateOne(
      { _id: investmentId },
      { $set: { lastProfitAddedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    );
    await distributeProfits();

    const [updatedUser, updatedInvestment] = await Promise.all([
      User.findById(user._id),
      Investment.findById(investmentId),
    ]);
    expect(updatedUser.totalBalance).toBe(5500);
    expect(updatedUser.totalEarnings).toBe(500);
    expect(updatedInvestment.profitEarned).toBe(500);
    expect(await Transaction.countDocuments({ user: user._id, type: 'Profit', referenceId: investmentId })).toBe(2);
  });

  it('catches up profit for multiple complete missed days', async () => {
    const { user, plan } = await createUserAndPlan();
    const activation = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ planId: plan._id.toString() });
    const investmentId = activation.body.data._id;

    await Investment.updateOne(
      { _id: investmentId },
      { $set: { lastProfitAddedAt: new Date(Date.now() - 72 * 60 * 60 * 1000) } }
    );
    await distributeProfits();

    const [updatedUser, updatedInvestment] = await Promise.all([
      User.findById(user._id),
      Investment.findById(investmentId),
    ]);
    expect(updatedUser.totalBalance).toBe(6000);
    expect(updatedUser.totalEarnings).toBe(1000);
    expect(updatedInvestment.profitEarned).toBe(1000);
  });

  it('returns principal and only unpaid profit at maturity', async () => {
    const { user, plan } = await createUserAndPlan();
    const activation = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ planId: plan._id.toString() });
    const investmentId = activation.body.data._id;

    await Investment.updateOne(
      { _id: investmentId },
      { $set: { endDate: new Date(Date.now() - 1000), profitEarned: 2000 } }
    );
    await distributeProfits();

    const [updatedUser, updatedInvestment] = await Promise.all([
      User.findById(user._id),
      Investment.findById(investmentId),
    ]);
    expect(updatedInvestment.status).toBe('completed');
    expect(updatedUser.totalBalance).toBe(10750);
    expect(updatedUser.totalEarnings).toBe(750);
    expect(await Transaction.countDocuments({ user: user._id, type: 'Profit', referenceId: investmentId })).toBe(2);
  });
});
