import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  meHandler,
  createUserHandler,
  listUsersHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/authController.js';
import { authMiddleware } from '../../../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', authMiddleware, logoutHandler);
router.get('/me', authMiddleware, meHandler);

router.post('/users', authMiddleware, requireRole(['admin']), createUserHandler);
router.get('/users', authMiddleware, requireRole(['admin']), listUsersHandler);
router.put('/users/:id', authMiddleware, requireRole(['admin']), updateUserHandler);
router.delete('/users/:id', authMiddleware, requireRole(['admin']), deleteUserHandler);

export default router;
