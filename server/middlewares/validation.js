import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param || err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Name contains invalid characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),

  body('phone')
    .matches(/^\+?[1-9]\d{6,14}|0\d{6,14}$/).withMessage('Valid phone number is required'),
  body('referralCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 4, max: 20 }).withMessage('Referral code must be 4-20 characters'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateOTP = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
  handleValidationErrors,
];

export const validateSendLoginOTP = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors,
];

export const validateLoginWithOTP = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors,
];

export const validateResetPassword = [
  param('token').isLength({ min: 40, max: 40 }).withMessage('Invalid token format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('confirmPassword').optional({ checkFalsy: true }).custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  handleValidationErrors,
];

export const validateChangePassword = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required'),
  body('confirmPassword').optional({ checkFalsy: true }).custom((value, { req }) => {
    if (value && value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  handleValidationErrors,
];

export const validateUpdateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().matches(/^\+?[1-9]\d{6,14}|0\d{6,14}$/).withMessage('Valid phone number is required'),
  body('cnic').optional().matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('CNIC must be in format 00000-0000000-0'),
  handleValidationErrors,
];

export const validateCreateAdmin = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('phone').matches(/^\+?[1-9]\d{6,14}|0\d{6,14}$/).withMessage('Valid phone number is required'),
  handleValidationErrors,
];

export const validateCreatePlan = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Plan name must be 1-100 characters'),
  body('depositAmount').isNumeric().withMessage('Deposit amount must be a number'),
  body('dailyProfit').isNumeric().withMessage('Daily profit must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('totalReturn').isNumeric().withMessage('Total return must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  handleValidationErrors,
];

export const validateDeposit = [
  body('amount').isFloat({ min: 300 }).withMessage('Minimum deposit is 300'),
  body('paymentMethod').isIn(['JazzCash', 'Easypaisa', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib']).withMessage('Invalid payment method'),
  body('transactionId').trim().isLength({ min: 5, max: 50 }).withMessage('Transaction ID must be 5-50 characters'),
  handleValidationErrors,
];

export const validateWithdrawal = [
  body('amount').isFloat({ min: 300 }).withMessage('Minimum withdrawal is 300'),
  body('paymentMethod').isIn(['JazzCash', 'Easypaisa', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib']).withMessage('Invalid payment method'),
  body('accountTitle').trim().isLength({ min: 2, max: 100 }).withMessage('Account title is required (2-100 characters)'),
  body('accountNumber').trim().isLength({ min: 5, max: 30 }).withMessage('Valid account number is required'),
  handleValidationErrors,
];

export const validateSupportTicket = [
  body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject must be 3-200 characters'),
  body('category').isIn(['General', 'Deposit', 'Withdrawal', 'Investment', 'Other']).withMessage('Invalid category'),
  body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
  handleValidationErrors,
];

export const validateSupportReply = [
  body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
  handleValidationErrors,
];

export const validateSettingsUpdate = [
  body('websiteLogo').optional().trim(),
  body('heroBanner').optional().trim(),
  body('contactEmail').optional().isEmail().withMessage('Valid email required'),
  body('contactPhone').optional().trim(),
  body('whatsappNumber').optional().trim(),
  body('socialLinks.facebook').optional().trim().isURL().withMessage('Invalid Facebook URL'),
  body('socialLinks.twitter').optional().trim().isURL().withMessage('Invalid Twitter URL'),
  body('socialLinks.instagram').optional().trim().isURL().withMessage('Invalid Instagram URL'),
  body('socialLinks.youtube').optional().trim().isURL().withMessage('Invalid YouTube URL'),
  body('maintenanceMode').optional().isBoolean().withMessage('maintenanceMode must be a boolean'),
  body('minimumWithdrawal').optional().isFloat({ min: 0 }).withMessage('Minimum withdrawal must be positive'),
  body('maximumWithdrawal').optional().isFloat({ min: 0 }).withMessage('Maximum withdrawal must be positive'),
  body('minimumDeposit').optional().isFloat({ min: 0 }).withMessage('Minimum deposit must be positive'),
  handleValidationErrors,
];

export const validateInvestment = [
  body('planId').isMongoId().withMessage('Invalid plan ID'),
  handleValidationErrors,
];

export const validateNotification = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('message').trim().isLength({ min: 5, max: 1000 }).withMessage('Message must be 5-1000 characters'),
  body('type').optional().isIn(['Deposit', 'Withdrawal', 'Profit', 'System', 'Offer']).withMessage('Invalid notification type'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors,
];

export const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
];
