import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    websiteLogo: {
      type: String,
      default: 'logo.png',
    },
    heroBanner: {
      type: String,
      default: 'banner.png',
    },
    contactEmail: {
      type: String,
      default: 'support@eredbloo.com',
    },
    contactPhone: {
      type: String,
      default: '+92 300 1234567',
    },
    whatsappNumber: {
      type: String,
      default: '+92 300 1234567',
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
    },
    paymentAccounts: [
      {
        method: {
          type: String,
          enum: ['JazzCash', 'Easypaisa', 'Bank Transfer', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib'],
        },
        accountTitle: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' },   // for bank transfers
        branchCode: { type: String, default: '' },  // for bank transfers
        iban: { type: String, default: '' },         // for bank transfers
        isActive: { type: Boolean, default: true },
        instructions: { type: String, default: '' }, // any extra instructions
      }
    ],
    referralCommissionRates: {
      level1: { type: Number, default: 10 },
      level2: { type: Number, default: 5 },
      level3: { type: Number, default: 2 },
    },
    referralBonusPercentage: { type: Number, default: 5 },
    referralBonusMax: { type: Number, default: 5000 },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    minimumWithdrawal: {
      type: Number,
      default: 300,
    },
    maximumWithdrawal: {
      type: Number,
      default: 500000,
    },
    minimumDeposit: {
      type: Number,
      default: 300,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
