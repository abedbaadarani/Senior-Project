import express from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import alumniRoutes from './alumniRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import messageRoutes from './messageRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/audit', auditLogRoutes);
router.use('/alumni', alumniRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);

export default router;
