import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { validateUpdateProfile } from '../middlewares/validation.js';

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, cnic } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (cnic !== undefined) user.cnic = cnic;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        cnic: updatedUser.cnic,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        referralCode: updatedUser.referralCode,
        profilePicture: updatedUser.profilePicture,
        totalBalance: updatedUser.totalBalance,
        totalInvestment: updatedUser.totalInvestment,
        totalEarnings: updatedUser.totalEarnings,
        todayEarnings: updatedUser.todayEarnings,
        totalWithdrawals: updatedUser.totalWithdrawals,
        referralEarnings: updatedUser.referralEarnings,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name email profilePicture isVerified totalBalance totalInvestment totalEarnings totalWithdrawals referralEarnings referralCode todayEarnings');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalTeamMembers = await User.countDocuments({ referredBy: req.user._id });

    // Compute today's earnings from the ledger (authoritative & self-resetting)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayAgg = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          isPositive: true,
          type: { $in: ['Profit', 'Referral Commission', 'Referral Bonus'] },
          status: { $in: ['Success', 'Approved'] },
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayEarnings = todayAgg[0]?.total || 0;

    // Count active investments
    const Investment = (await import('../models/Investment.js')).default;
    const activeInvestments = await Investment.countDocuments({ user: user._id, status: 'active' });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        totalBalance: user.totalBalance,
        totalInvestment: user.totalInvestment,
        totalEarnings: user.totalEarnings,
        todayEarnings,
        totalWithdrawals: user.totalWithdrawals,
        referralEarnings: user.referralEarnings,
        totalTeamMembers,
        activeInvestments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReferralStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const totalTeamMembers = await User.countDocuments({ referredBy: req.user._id });
    const totalReferralEarnings = user?.referralEarnings || 0;

    const teamMembers = await User.find({ referredBy: req.user._id })
      .select('name email totalInvestment createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalTeamMembers,
        totalReferralEarnings,
        teamMembers: teamMembers.map(m => ({
          name: m.name,
          email: m.email,
          totalInvestment: m.totalInvestment || 0,
          joinedAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getUserProfile, updateUserProfile, getDashboardStats, getReferralStats };
