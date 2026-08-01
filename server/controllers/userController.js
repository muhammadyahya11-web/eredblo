import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import cloudinary from '../config/cloudinary.js';
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
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Level 1: Direct Referrals
    const level1Members = await User.find({ referredBy: req.user._id })
      .select('name email totalInvestment createdAt status')
      .sort({ createdAt: -1 });
    const level1Ids = level1Members.map(m => m._id);

    // Level 2 Referrals
    const level2Members = level1Ids.length > 0
      ? await User.find({ referredBy: { $in: level1Ids } }).select('name email totalInvestment createdAt status').sort({ createdAt: -1 })
      : [];
    const level2Ids = level2Members.map(m => m._id);

    // Level 3 Referrals
    const level3Members = level2Ids.length > 0
      ? await User.find({ referredBy: { $in: level2Ids } }).select('name email totalInvestment createdAt status').sort({ createdAt: -1 })
      : [];

    const allMembers = [
      ...level1Members.map(m => ({ member: m, level: 1 })),
      ...level2Members.map(m => ({ member: m, level: 2 })),
      ...level3Members.map(m => ({ member: m, level: 3 })),
    ];
    const totalTeamMembers = allMembers.length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Aggregate all referral totals from the authoritative transaction ledger.
    const referralEarningsAgg = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: { $in: ['Referral Commission', 'Referral Bonus'] },
          status: { $in: ['Success', 'Approved'] },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          monthly: {
            $sum: { $cond: [{ $gte: ['$createdAt', monthStart] }, '$amount', 0] },
          },
        },
      },
    ]);

    const levelEarningsAgg = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'Referral Commission',
          status: { $in: ['Success', 'Approved'] },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: "$description", regex: /Level 1/i } }, 'level1',
              { $cond: [
                { $regexMatch: { input: "$description", regex: /Level 2/i } }, 'level2',
                { $cond: [
                  { $regexMatch: { input: "$description", regex: /Level 3/i } }, 'level3',
                  'other'
                ]}
              ]}
            ]
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    let level1Earn = 0, level2Earn = 0, level3Earn = 0, totalBonuses = 0;
    referralEarningsAgg.forEach(item => {
      if (item._id === 'Referral Bonus') totalBonuses = item.total;
    });
    levelEarningsAgg.forEach(item => {
      if (item._id === 'level1') level1Earn = item.total;
      if (item._id === 'level2') level2Earn = item.total;
      if (item._id === 'level3') level3Earn = item.total;
    });

    const memberData = allMembers.map(({ member: m, level }) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      totalInvestment: m.totalInvestment || 0,
      joinedAt: m.createdAt,
      status: m.status,
      level,
    }));
    const totalReferralEarnings = referralEarningsAgg.reduce((sum, item) => sum + item.total, 0);
    const monthlyEarnings = referralEarningsAgg.reduce((sum, item) => sum + item.monthly, 0);

    res.json({
      success: true,
      data: {
        totalTeamMembers,
        totalReferralEarnings,
        totalBonuses,
        monthlyEarnings,
        level1Count: level1Members.length,
        level2Count: level2Members.length,
        level3Count: level3Members.length,
        level1Earn,
        level2Earn,
        level3Earn,
        teamMembers: memberData,
        allMembers: memberData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ered-bloo/profiles', resource_type: 'image', transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error) return reject(new Error('Failed to upload image'));
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: result.secure_url },
      { new: true }
    );

    // Update user context data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cnic: user.cnic,
      role: user.role,
      isVerified: user.isVerified,
      referralCode: user.referralCode,
      profilePicture: user.profilePicture,
      totalBalance: user.totalBalance,
      totalInvestment: user.totalInvestment,
      totalEarnings: user.totalEarnings,
      todayEarnings: user.todayEarnings,
      totalWithdrawals: user.totalWithdrawals,
      referralEarnings: user.referralEarnings,
      createdAt: user.createdAt,
    };

    res.json({ success: true, data: userData, message: 'Profile picture updated successfully' });
  } catch (error) {
    next(error);
  }
};

export { getUserProfile, updateUserProfile, getDashboardStats, getReferralStats, uploadProfilePicture };
