import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createDeposit,
  getUserDeposits,
  getAllDeposits,
  updateDepositStatus,
} from '../controllers/depositController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateDeposit } from '../middlewares/validation.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `deposit-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, WebP, and PDF files are allowed'));
  },
});

router.post('/', protect, upload.single('screenshot'), validateDeposit, createDeposit);
router.get('/my-deposits', protect, getUserDeposits);
router.get('/', protect, admin, getAllDeposits);
router.put('/:id/status', protect, admin, updateDepositStatus);

export default router;
