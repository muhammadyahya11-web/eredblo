import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const sa = await User.findOne({ role: 'super-admin' });
const token = jwt.sign({ id: sa._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
const h = { Authorization: `Bearer ${token}` };

const test = async (label, url) => {
  const r = await fetch(`http://localhost:5000/api${url}`, { headers: h });
  const j = await r.json();
  console.log(label, '=> success:', j.success, '| total:', j.total, '| pages:', j.pages, '| count:', Array.isArray(j.data) ? j.data.length : 'n/a');
};

await test('users', '/admin/users?page=1&limit=2');
await test('admins', '/admin/admins?page=1&limit=2');
await test('plans', '/plans?page=1&limit=2');
await test('deposits', '/deposits?page=1&limit=2');
await test('withdrawals', '/withdrawals?page=1&limit=2');
await test('transactions', '/transactions?page=1&limit=2');
await test('support', '/support?page=1&limit=2');
await test('notifications', '/notifications/all-admin?page=1&limit=2');
await test('gifts', '/gifts/admin/all?page=1&limit=2');

await mongoose.disconnect();
process.exit(0);
