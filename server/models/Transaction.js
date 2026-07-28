import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Deposit', 'Withdrawal', 'Investment', 'Profit', 'Referral Commission', 'Referral Bonus'],
    },
    amount: {
      type: Number,
      required: true,
    },
    isPositive: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Approved', 'Rejected'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.ObjectId,
      // Can reference Deposit, Withdrawal, or Investment depending on the type
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
