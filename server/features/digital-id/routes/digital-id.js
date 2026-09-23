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
router.put('', authMiddleware, upload.single('photo'), putDigitalIdHandler);
router.delete('', authMiddleware, deleteDigitalIdHandler);

export default router;
