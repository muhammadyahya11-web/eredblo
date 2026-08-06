import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Promo code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Promo code cannot exceed 20 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be a positive number'],
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if promo is valid
promoCodeSchema.virtual('isValid').get(function () {
  return (
    this.isActive &&
    this.usedCount < this.maxUses &&
    new Date(this.expiryDate) > new Date()
  );
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
export default PromoCode;
