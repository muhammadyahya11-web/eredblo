import PromoCode from '../models/PromoCode.js';

export const createPromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, maxUses, expiryDate } = req.body;
    
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Promo code already exists' });
    }

    const promoCode = await PromoCode.create({
      code,
      discountType,
      discountValue,
      maxUses,
      expiryDate,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: promoCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort('-createdAt').populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: promoCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const { isActive, maxUses, expiryDate } = req.body;
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { isActive, maxUses, expiryDate },
      { new: true, runValidators: true }
    );
    if (!promoCode) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    res.status(200).json({ success: true, data: promoCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
