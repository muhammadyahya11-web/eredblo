import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
    },
    dailyProfit: {
      type: Number,
      required: [true, 'Daily profit amount is required'],
    },
    duration: {
      type: Number, // in days
      required: [true, 'Duration in days is required'],
    },
    totalReturn: {
      type: Number,
      required: [true, 'Total return amount is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

planSchema.index({ status: 1, createdAt: -1 });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
