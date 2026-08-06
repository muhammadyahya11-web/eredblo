import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('performedBy', 'name email role')
        .populate('targetUser', 'name email'),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuditLog = async ({ action, category, performedBy, targetUser, details, ipAddress, status = 'success' }) => {
  try {
    await AuditLog.create({ action, category, performedBy, targetUser, details, ipAddress, status });
  } catch (e) {
    // Silently fail — audit logging should never break the main flow
    console.error('[AuditLog] Failed to write log:', e.message);
  }
};

export const deleteAuditLog = async (req, res) => {
  try {
    await AuditLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearAllAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ success: true, message: 'All audit logs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
