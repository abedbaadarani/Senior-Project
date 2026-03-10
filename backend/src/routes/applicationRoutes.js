import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
    applyForOpportunity,
    getMyApplications,
    getApplicationsForOpportunity,
    updateApplicationStatus,
    checkApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

// General user actions
router.post('/apply', requireAuth, applyForOpportunity);
router.get('/my-applications', requireAuth, getMyApplications);
router.get('/check/:opportunityId', requireAuth, checkApplicationStatus);

// Admin/Owner actions
router.get('/opportunity/:opportunityId', requireAuth, getApplicationsForOpportunity);
router.patch('/:applicationId/status', requireAuth, requireRole('INSTRUCTOR', 'ALUMNI', 'ADMIN', 'HEAD_ADMIN'), updateApplicationStatus);

export default router;
