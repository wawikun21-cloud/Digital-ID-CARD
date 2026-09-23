import { Router } from 'express';
import {
  getAllDigitalIds,
  getDigitalIdByUserId,
  saveDigitalIdForUser,
  deleteDigitalIdByUserId,
} from '../../digital-id/services/digitalIdService.js';
import { authMiddleware } from '../../../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/digital-id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const records = await getAllDigitalIds();
    res.json(records);
  } catch (err) {
    console.error('GET /api/admin/digital-id error', err);
    res.status(500).json({ error: 'Failed to load digital IDs.' });
  }
});

router.put('/digital-id/:userId', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.userId;
    const saved = await saveDigitalIdForUser(userId, req.body, null);
    res.json(saved);
  } catch (err) {
    console.error('PUT /api/admin/digital-id/:userId error', err);
    res.status(500).json({ error: 'Failed to save digital ID.' });
  }
});

router.delete('/digital-id/:userId', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.userId;
    await deleteDigitalIdByUserId(userId);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/admin/digital-id/:userId error', err);
    res.status(500).json({ error: 'Failed to delete digital ID.' });
  }
});

export default router;
