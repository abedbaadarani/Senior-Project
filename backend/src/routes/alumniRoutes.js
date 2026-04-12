import express from 'express';
import { getPendingAlumni, approveAlumni, rejectAlumni, getVerifiedAlumni } from '../controllers/alumniController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// INSTRUCTORS, ADMINs, and HEAD_ADMIN can moderate alumni approvals
router.get('/pending', requireAuth, requireRole('INSTRUCTOR', 'ADMIN', 'HEAD_ADMIN'), getPendingAlumni);
router.patch('/:id/approve', requireAuth, requireRole('INSTRUCTOR', 'ADMIN', 'HEAD_ADMIN'), approveAlumni);
router.delete('/:id/reject', requireAuth, requireRole('INSTRUCTOR', 'ADMIN', 'HEAD_ADMIN'), rejectAlumni);

// Verified alumni directory
router.get('/', requireAuth, getVerifiedAlumni);

export default router;
