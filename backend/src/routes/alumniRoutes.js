import express from 'express';
import { getPendingAlumni, approveAlumni, rejectAlumni, getVerifiedAlumni } from '../controllers/alumniController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only INSTRUCTORS can moderate alumni approvals
router.get('/pending', requireAuth, requireRole('INSTRUCTOR'), getPendingAlumni);
router.patch('/:id/approve', requireAuth, requireRole('INSTRUCTOR'), approveAlumni);
router.delete('/:id/reject', requireAuth, requireRole('INSTRUCTOR'), rejectAlumni);

// Verified alumni directory
router.get('/', requireAuth, getVerifiedAlumni);

export default router;
