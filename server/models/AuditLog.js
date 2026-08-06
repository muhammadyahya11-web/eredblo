import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['user', 'admin', 'deposit', 'withdrawal', 'plan', 'settings', 'promo', 'bonus', 'system'],
      default: 'system',
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
