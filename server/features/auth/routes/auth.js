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
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(loginHandler));
router.post('/logout', authMiddleware, asyncHandler(logoutHandler));
router.get('/me', authMiddleware, asyncHandler(meHandler));

router.post('/users', authMiddleware, requireRole(['admin']), asyncHandler(createUserHandler));
router.get('/users', authMiddleware, requireRole(['admin']), asyncHandler(listUsersHandler));
router.put('/users/:id', authMiddleware, requireRole(['admin']), asyncHandler(updateUserHandler));
router.delete('/users/:id', authMiddleware, requireRole(['admin']), asyncHandler(deleteUserHandler));

export default router;