import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  getMyOpportunities,
  updateOpportunity,
  deleteOpportunity,
  toggleBookmark,
  getBookmarks,
} from '../controllers/opportunityController.js';

const router = express.Router();

// Public authenticated endpoints
router.get('/', requireAuth, getOpportunities);
router.get('/bookmarks', requireAuth, getBookmarks);
router.get('/mine', requireAuth, requireRole('INSTRUCTOR', 'ALUMNI'), getMyOpportunities);
router.get('/:id', requireAuth, getOpportunityById);
router.post('/:id/bookmark', requireAuth, toggleBookmark);

// Creator endpoints
router.post('/', requireAuth, requireRole('INSTRUCTOR', 'ALUMNI'), createOpportunity);
router.patch('/:id', requireAuth, requireRole('INSTRUCTOR', 'ALUMNI'), updateOpportunity);

// Delete endpoint (Creator or Admin)
router.delete('/:id', requireAuth, deleteOpportunity);

export default router;
