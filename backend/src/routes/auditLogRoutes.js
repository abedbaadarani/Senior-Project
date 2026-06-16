import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { getAuditLogs } from '../controllers/auditLogController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'HEAD_ADMIN'), getAuditLogs);

export default router;
