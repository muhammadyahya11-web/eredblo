import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cookieParser from 'cookie-parser';
import xss from 'xss';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import planRoutes from './routes/planRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import earningsRoutes from './routes/earningsRoutes.js';
import giftRoutes from './routes/giftRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import maintenanceMode from './middlewares/maintenanceMode.js';
import { isServerlessRuntime } from './utils/uploadPath.js';
import { startProfitScheduler } from './utils/profitEngine.js';
import Settings from './models/Settings.js';

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  await connectDB();

  // Initialize default settings if none exist
  try {
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({});
      console.log('[Settings] Default settings initialized.');
    }
  } catch (err) {
    console.error('[Settings] Failed to initialize settings:', err.message);
  }

  // Start profit distribution scheduler (only on traditional servers, not serverless)
  if (!isServerlessRuntime) {
    startProfitScheduler();
  }
}

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Build list of allowed origins for CSP connectSrc
const allowedConnectSrc = ["'self'"];
if (isProd && process.env.CLIENT_URL) {
  allowedConnectSrc.push(process.env.CLIENT_URL);
  // Also add the API server URL itself so the frontend can reach it
  if (process.env.API_URL) allowedConnectSrc.push(process.env.API_URL);
} else {
  allowedConnectSrc.push('http://localhost:*', 'http://127.0.0.1:*');
}

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: allowedConnectSrc,
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled to avoid breaking third-party resources
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const corsOrigin = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5174" ,"https://eredblo.vercel.app"];

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      const value = obj[key];
      if (value && typeof value === 'object') {
        clean(value);
      } else if (typeof value === 'string') {
        obj[key] = xss(value);
      }
    }
  };
  try {
    clean(req.body);
    clean(req.query);
    clean(req.params);
  } catch {}
  next();
});

const createRateLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      return (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || 'unknown';
    },
  });

app.use('/api', createRateLimiter(15 * 60 * 1000, 1000, 'Too many requests, please try again later'));

app.use('/api/auth/login', createRateLimiter(15 * 60 * 1000, 10, 'Too many login attempts, please try again later'));
app.use('/api/auth/register', createRateLimiter(60 * 60 * 1000, 5, 'Too many registration attempts'));
app.use('/api/auth/verify-otp', createRateLimiter(15 * 60 * 1000, 5, 'Too many OTP requests'));
app.use('/api/auth/send-login-otp', createRateLimiter(15 * 60 * 1000, 5, 'Too many OTP requests'));
app.use('/api/auth/login-with-otp', createRateLimiter(15 * 60 * 1000, 5, 'Too many OTP login attempts'));
app.use('/api/auth/forgot-password', createRateLimiter(15 * 60 * 1000, 10, 'Too many attempts'));
app.use('/api/auth/reset-password', createRateLimiter(15 * 60 * 1000, 10, 'Too many attempts'));

app.use('/api/auth/login', slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 3, delayMs: () => 500 }));
app.use('/api/auth/register', slowDown({ windowMs: 60 * 60 * 1000, delayAfter: 2, delayMs: () => 1000 }));
app.use('/api/auth/send-login-otp', slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 3, delayMs: () => 500 }));
app.use('/api/auth/login-with-otp', slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 3, delayMs: () => 500 }));

// ⚠️ Maintenance mode must be applied BEFORE routes so all API calls are blocked
// app.use(maintenanceMode);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/gifts', giftRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ERED BLOO API is running...', status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

if (!isServerlessRuntime) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
  });
}

export default app;
