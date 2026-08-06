import express from 'express';
import { distributeProfits } from '../utils/profitEngine.js';

const router = express.Router();

// Called by the Vercel Cron scheduler (see vercel.json "crons").
// Protected by CRON_SECRET rather than a user JWT so the scheduler can invoke it.
router.post('/distribute-profit', async (req, res, next) => {
  try {
    const secret = req.headers['x-cron-secret'] || req.query.secret;
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await distributeProfits();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
