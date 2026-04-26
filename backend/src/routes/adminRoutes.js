import express from 'express';
import { createAdmin, createInstructor, resetUserPassword } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-admin', requireAuth, requireRole('HEAD_ADMIN'), createAdmin);
router.post('/create-instructor', requireAuth, requireRole('ADMIN', 'HEAD_ADMIN'), createInstructor);
router.patch('/reset-password/:userId', requireAuth, requireRole('ADMIN', 'HEAD_ADMIN'), resetUserPassword);

export default router;
