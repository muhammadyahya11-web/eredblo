import request from 'supertest';
import app from '../server.js';
import { connectTestDB, closeTestDB, clearTestDB } from './db.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import generateToken from '../utils/generateToken.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Maintenance mode', () => {
  it('allows super-admin API access and blocks regular users', async () => {
    await Settings.create({ maintenanceMode: true });
    const superAdmin = await User.create({ name: 'Super Admin', email: 'super@example.com', password: 'Password123!', phone: '03001234567', role: 'super-admin' });
    const user = await User.create({ name: 'User', email: 'user@example.com', password: 'Password123!', phone: '03007654321' });

    const superResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${generateToken(superAdmin._id)}`);
    const userResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${generateToken(user._id)}`);

    expect(superResponse.statusCode).toBe(200);
    expect(userResponse.statusCode).toBe(503);
  });
});
