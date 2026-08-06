import express from 'express';
import { protect, superAdmin } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
router.use(protect, superAdmin);

// GET /api/bonus - list users for bonus issuance (search)
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'user', status: 'active' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('name email referralCode totalBalance').limit(20);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bonus/issue - issue a manual bonus to a user
router.post('/issue', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'userId and a positive amount are required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.totalBalance += Number(amount);
    user.totalEarnings += Number(amount);
    await user.save();

    await Transaction.create({
      user: userId,
      type: 'Bonus',
      amount: Number(amount),
      status: 'Completed',
      description: reason || 'Manual bonus by super admin',
      isPositive: true,
    });

    res.json({ success: true, message: `Bonus of PKR ${amount} issued to ${user.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bonus/history - get recent bonus transactions
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [txns, total] = await Promise.all([
      Transaction.find({ type: 'Bonus' })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email'),
      Transaction.countDocuments({ type: 'Bonus' }),
    ]);
    res.json({ success: true, data: txns, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
