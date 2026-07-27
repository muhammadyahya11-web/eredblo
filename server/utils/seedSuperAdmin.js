import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@eredbloo.com').toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || generateStrongPassword();
  const phone = process.env.SUPER_ADMIN_PHONE || '0000000000';

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.role = 'super-admin';
      user.status = 'active';
      user.isVerified = true;
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      await user.save();
      console.log(`Existing account promoted to super-admin: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'super-admin',
        isVerified: true,
      });
      console.log('Super Admin created successfully');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
      console.log('   Please store this password securely. DO NOT share it.');
    }
  } catch (error) {
    console.error('Failed to seed super admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

function generateStrongPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

run();
