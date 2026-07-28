import Transaction from '../models/Transaction.js';

const getUserTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id, isPositive: true } },
      { $group: { _id: null, totalCredits: { $sum: '$amount' } } },
    ]);

    const creditSummary = summary[0] || { totalCredits: 0 };

    res.json({
      success: true,
      data: transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      summary: creditSummary,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, userId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({ success: true, data: transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export { getUserTransactions, getAllTransactions };
