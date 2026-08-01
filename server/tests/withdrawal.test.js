import request from 'supertest';
import app from '../server.js';
import { connectTestDB, closeTestDB, clearTestDB } from './db.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Withdrawal from '../models/Withdrawal.js';
import generateToken from '../utils/generateToken.js';

let user;
let admin;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  user = await User.create({ name: 'Withdraw User', email: 'withdraw@example.com', password: 'Password123!', phone: '03001234567', totalBalance: 10000 });
  admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!', phone: '03007654321', role: 'admin' });
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Withdrawal fee', () => {
  it('applies the default 3 percent fee and holds the requested amount', async () => {
    const response = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ amount: 1000, paymentMethod: 'JazzCash', accountTitle: 'Withdraw User', accountNumber: '03001234567' });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.feePercentage).toBe(3);
    expect(response.body.data.feeAmount).toBe(30);
    expect(response.body.data.netAmount).toBe(970);
    expect((await User.findById(user._id)).totalBalance).toBe(9000);
  });

  it('uses the configured fee and records net lifetime withdrawals on approval', async () => {
    await Settings.create({ withdrawalFeePercentage: 5 });
    const created = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ amount: 2000, paymentMethod: 'HBL', accountTitle: 'Withdraw User', accountNumber: '1234567890' });

    const approved = await request(app)
      .put(`/api/withdrawals/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${generateToken(admin._id)}`)
      .send({ status: 'Approved' });

    expect(approved.statusCode).toBe(200);
    expect(created.body.data.feeAmount).toBe(100);
    expect(created.body.data.netAmount).toBe(1900);
    expect((await User.findById(user._id)).totalWithdrawals).toBe(1900);
  });

  it('refunds the full held amount when rejected', async () => {
    await Settings.create({ withdrawalFeePercentage: 5 });
    const created = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${generateToken(user._id)}`)
      .send({ amount: 2000, paymentMethod: 'Easypaisa', accountTitle: 'Withdraw User', accountNumber: '03001234567' });

    await request(app)
      .put(`/api/withdrawals/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${generateToken(admin._id)}`)
      .send({ status: 'Rejected' });

    expect((await User.findById(user._id)).totalBalance).toBe(10000);
    expect((await Withdrawal.findById(created.body.data._id)).status).toBe('Rejected');
  });

  it('approves legacy withdrawals that do not have stored fee fields', async () => {
    const legacyWithdrawal = await Withdrawal.collection.insertOne({
      user: user._id,
      amount: 1000,
      paymentMethod: 'JazzCash',
      accountTitle: 'Withdraw User',
      accountNumber: '03001234567',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .put(`/api/withdrawals/${legacyWithdrawal.insertedId}/status`)
      .set('Authorization', `Bearer ${generateToken(admin._id)}`)
      .send({ status: 'Approved' });

    expect(response.statusCode).toBe(200);
    expect((await User.findById(user._id)).totalWithdrawals).toBe(970);
  });
});
