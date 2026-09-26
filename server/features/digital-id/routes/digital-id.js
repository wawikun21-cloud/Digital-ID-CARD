import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  getDigitalIdHandler,
  putDigitalIdHandler,
  deleteDigitalIdHandler,
  getDigitalIdForAdminHandler,
  putDigitalIdForAdminHandler,
} from '../controllers/digitalIdController.js';
import { authMiddleware } from '../../../middleware/auth.js';
import { requireRole } from '../../auth/middleware/requireRole.js';

const router = Router();

router.get('', authMiddleware, getDigitalIdHandler);
router.put('', authMiddleware, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]), putDigitalIdHandler);
router.delete('', authMiddleware, deleteDigitalIdHandler);

// Admin-only: another user's card details (see the controller for which fields).
router.get('/admin/:userId', authMiddleware, requireRole(['admin']), getDigitalIdForAdminHandler);
router.put('/admin/:userId', authMiddleware, requireRole(['admin']), putDigitalIdForAdminHandler);

export default router;