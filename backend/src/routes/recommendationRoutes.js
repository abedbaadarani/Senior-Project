import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  createRecommendation,
  getMyRecommendationsAsInstructor,
  getMyRecommendationsAsStudent,
  getAllRecommendations,
} from '../controllers/recommendationController.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('INSTRUCTOR'), createRecommendation);
router.get('/mine', requireAuth, requireRole('INSTRUCTOR'), getMyRecommendationsAsInstructor);
router.get('/for-me', requireAuth, requireRole('STUDENT'), getMyRecommendationsAsStudent);
router.get('/', requireAuth, requireRole('ADMIN', 'HEAD_ADMIN'), getAllRecommendations);

export default router;
