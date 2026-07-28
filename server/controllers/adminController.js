import User from '../models/User.js';

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAdmins, activeUsers, blockedUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'blocked' }),
    ]);

    const agg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$totalBalance' },
          totalInvestment: { $sum: '$totalInvestment' },
          totalEarnings: { $sum: '$totalEarnings' },
          totalWithdrawals: { $sum: '$totalWithdrawals' },
        },
      },
    ]);

    const financials = agg[0] || { totalBalance: 0, totalInvestment: 0, totalEarnings: 0, totalWithdrawals: 0 };

    res.json({ success: true, data: { totalUsers, totalAdmins, activeUsers, blockedUsers, ...financials } });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'super-admin') {
      return res.status(403).json({ success: false, message: 'A super admin cannot be blocked' });
    }

    if (user.role === 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Only a super admin can manage admin accounts' });
    }

    const newStatus = req.body.status || (user.status === 'active' ? 'blocked' : 'active');
    user.status = newStatus;
    await user.save();

    res.json({ success: true, message: `User ${user.status === 'blocked' ? 'blocked' : 'activated'} successfully`, data: { status: user.status } });
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;


    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A user already exists with this email' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt,
      },
      message: 'Admin created successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'This user is not an admin' });
    }

    await admin.deleteOne();
    res.json({ success: true, message: 'Admin removed successfully', data: { _id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

export { getStats, getAllUsers, updateUserStatus, getAdmins, createAdmin, deleteAdmin };
