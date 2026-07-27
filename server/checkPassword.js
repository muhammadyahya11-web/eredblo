import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eredbloo';

const checkPassword = async () => {
  await mongoose.connect(MONGO_URI);
  const User = (await import('./models/User.js')).default;
  
  const user = await User.findOne({ email: 'superadmin@eredbloo.com' }).select('+password');
  if (!user) {
    console.log('Super admin not found');
    process.exit(1);
  }
  
  console.log('User found:', user.email, user.name, user.role);
  console.log('Password hash exists:', !!user.password);
  
  const testPassword = 'SuperAdminPassword123';
  const isMatch = await bcrypt.compare(testPassword, user.password);
  console.log(`Password "${testPassword}" matches:`, isMatch);
  
  // Reset password
  user.password = await bcrypt.hash('SuperAdminPassword123', 10);
  await user.save();
  console.log('Password has been reset to: SuperAdminPassword123');
  
  // Verify again
  const isMatch2 = await bcrypt.compare('SuperAdminPassword123', user.password);
  console.log('Verification after reset:', isMatch2);
  
  await mongoose.disconnect();
};

checkPassword().catch(err => {
  console.error(err);
  process.exit(1);
});
