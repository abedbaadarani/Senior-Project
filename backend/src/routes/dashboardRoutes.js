import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  getStudentStats,
  getAlumniStats,
  getInstructorStats,
  getAdminStats,
  getHeadAdminStats,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/student-stats', requireAuth, requireRole('STUDENT'), getStudentStats);
router.get('/alumni-stats', requireAuth, requireRole('ALUMNI'), getAlumniStats);
router.get('/instructor-stats', requireAuth, requireRole('INSTRUCTOR'), getInstructorStats);
router.get('/admin-stats', requireAuth, requireRole('ADMIN', 'HEAD_ADMIN'), getAdminStats);
router.get('/head-admin-stats', requireAuth, requireRole('HEAD_ADMIN'), getHeadAdminStats);

export default router;
