import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  getDigitalIdHandler,
  putDigitalIdHandler,
  deleteDigitalIdHandler,
} from '../controllers/digitalIdController.js';
import { authMiddleware } from '../../../middleware/auth.js';

const router = Router();

router.get('', authMiddleware, getDigitalIdHandler);
router.put('', authMiddleware, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]), putDigitalIdHandler);
router.delete('', authMiddleware, deleteDigitalIdHandler);

export default router;
