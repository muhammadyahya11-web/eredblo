import Settings from '../models/Settings.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const maintenanceLoginPaths = [
  '/auth/login',
  '/auth/send-login-otp',
  '/auth/login-with-otp',
];

const isMaintenanceLoginRequest = (req) => {
  const requestPaths = [req.originalUrl, `${req.baseUrl || ''}${req.path || ''}`, req.path]
    .filter(Boolean)
    .map((path) => path.split('?')[0].replace(/\/+$/, ''));

  return requestPaths.some((requestPath) =>
    maintenanceLoginPaths.some((loginPath) => requestPath.endsWith(loginPath))
  );
};

const maintenanceMode = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return next();
    }
    const isMaintenance = settings.maintenanceMode || false;

    if (!isMaintenance || isMaintenanceLoginRequest(req)) {
      return next();
    }

    let user = req.user;
    const authorization = req.headers.authorization;

    if (!user && authorization?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('role');
      } catch {
        // Invalid tokens are treated as unauthenticated during maintenance.
      }
    }
    console.log('Maintenance mode is active. User role:', user?.role);

    if (user?.role === 'Super Admin') {
      return next();
    }

    return res.status(503).json({
      success: false,
      message: 'Site is under maintenance. Only the super admin can access the platform.',
    });
  } catch (error) {
    next(error);
  }
};

export default maintenanceMode;
