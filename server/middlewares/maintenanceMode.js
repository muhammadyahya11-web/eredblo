import Settings from '../models/Settings.js';

const maintenanceMode = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return next();
    }
    const isMaintenance = settings.maintenanceMode || false;

    if (isMaintenance) {
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super-admin');
      if (!isAdmin) {
        return res.status(503).json({
          success: false,
          message: 'Site is under maintenance. Please check back later.',
        });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default maintenanceMode;
