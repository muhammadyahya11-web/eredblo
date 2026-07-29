import Settings from '../models/Settings.js';

const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      data: {
        websiteLogo: settings.websiteLogo,
        heroBanner: settings.heroBanner,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        whatsappNumber: settings.whatsappNumber,
        socialLinks: settings.socialLinks,
        paymentAccounts: settings.paymentAccounts,
        minimumWithdrawal: settings.minimumWithdrawal,
        maximumWithdrawal: settings.maximumWithdrawal,
        minimumDeposit: settings.minimumDeposit,
        referralCommissionRates: settings.referralCommissionRates,
        referralBonusPercentage: settings.referralBonusPercentage,
        referralBonusMax: settings.referralBonusMax,
        maintenanceMode: settings.maintenanceMode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings, getPublicSettings };
