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
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).select('-password').skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'super-admin') {
      return res.status(403).json({ success: false, message: 'A super admin account cannot be edited' });
    }

    if (user.role === 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Only a super admin can edit admin accounts' });
    }

    const { name, email, phone, cnic, role, status, isVerified, totalBalance, totalEarnings, todayEarnings } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (cnic !== undefined) user.cnic = cnic;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (status !== undefined && ['active', 'blocked'].includes(status)) user.status = status;
    if (role !== undefined && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    // Financial fields are restricted to super admins only
    if (req.user.role === 'super-admin') {
      if (totalBalance !== undefined && !isNaN(Number(totalBalance))) {
        user.totalBalance = Number(totalBalance);
      }
      if (totalEarnings !== undefined && !isNaN(Number(totalEarnings))) {
        user.totalEarnings = Number(totalEarnings);
      }
      if (todayEarnings !== undefined && !isNaN(Number(todayEarnings))) {
        user.todayEarnings = Number(todayEarnings);
      }
    }

    if (email !== undefined && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'A user already exists with this email' });
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'super-admin') {
      return res.status(403).json({ success: false, message: 'A super admin account cannot be deleted' });
    }

    if (user.role === 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Only a super admin can delete admin accounts' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully', data: { _id: req.params.id } });
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
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'admin' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [admins, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).select('-password').skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: admins, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
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

export { getStats, getAllUsers, updateUser, deleteUser, updateUserStatus, getAdmins, createAdmin, deleteAdmin };
