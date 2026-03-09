import express from 'express';
import { getPendingAlumni, approveAlumni } from '../controllers/alumniController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only INSTRUCTORS can moderate alumni approvals
router.get('/pending', requireAuth, requireRole('INSTRUCTOR'), getPendingAlumni);
router.patch('/:id/approve', requireAuth, requireRole('INSTRUCTOR'), approveAlumni);

export default router;
