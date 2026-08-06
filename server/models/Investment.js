import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.ObjectId,
      ref: 'Plan',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dailyProfit: {
      type: Number,
      required: true,
    },
    totalReturn: {
      type: Number,
      required: true,
    },
    profitEarned: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    lastProfitAddedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

investmentSchema.index({ user: 1, status: 1, createdAt: -1 });
investmentSchema.index({ status: 1, endDate: 1 });
investmentSchema.index({ user: 1, createdAt: 1 });

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;
