import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', requireAuth, getMyNotifications);
router.patch('/read-all', requireAuth, markAllAsRead);
router.patch('/:id/read', requireAuth, markAsRead);

export default router;
