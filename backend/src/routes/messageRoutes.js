import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    getConversations,
    getMessagesBetween,
    sendMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', requireAuth, getConversations);
router.get('/:partnerId', requireAuth, getMessagesBetween);
router.post('/send', requireAuth, sendMessage);

export default router;
