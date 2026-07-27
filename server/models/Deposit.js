import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['JazzCash', 'Easypaisa', 'Bank Transfer', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
    screenshot: {
      type: String, // Cloudinary URL or local path
      required: [true, 'Payment screenshot is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminMessage: {
      type: String,
      default: '',
    },
    notes: {
      type: String, // optional user note
    },
  },
  {
    timestamps: true,
  }
);

const Deposit = mongoose.model('Deposit', depositSchema);
export default Deposit;
