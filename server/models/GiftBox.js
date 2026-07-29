import mongoose from 'mongoose';

const giftBoxSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    depositId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Deposit',
      default: null,
    },
    title: {
      type: String,
      default: 'Special Mystery Gift Box',
    },
    giftType: {
      type: String,
      enum: ['Money', 'Motorcycle', 'Laptop', 'Phone', 'Other'],
      default: 'Money',
    },
    giftName: {
      type: String,
      required: [true, 'Gift name is required'],
    },
    amount: {
      type: Number,
      default: 0, // Cash amount if giftType is Money
    },
    description: {
      type: String,
      default: '',
    },
    unlocksAt: {
      type: Date,
      required: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    openedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GiftBox = mongoose.model('GiftBox', giftBoxSchema);
export default GiftBox;
