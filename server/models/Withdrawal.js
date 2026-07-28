import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['JazzCash', 'Easypaisa', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib'],
    },
    accountTitle: {
      type: String,
      required: [true, 'Account title is required'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminMessage: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
