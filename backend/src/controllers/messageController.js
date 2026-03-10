import messageRepository from '../data/messageRepository.js';
import notificationRepository from '../data/notificationRepository.js';

export const getConversations = async (req, res) => {
    try {
        const convos = await messageRepository.getConversations(req.user.id);
        res.status(200).json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

export const getMessagesBetween = async (req, res) => {
    try {
        const partnerId = parseInt(req.params.partnerId, 10);
        // Mark messages from this partner as read
        await messageRepository.markAsRead(req.user.id, partnerId);

        const messages = await messageRepository.getMessagesBetween(req.user.id, partnerId);
        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver ID and content are required' });
        }

        const message = await messageRepository.sendMessage(req.user.id, parseInt(receiverId, 10), content);

        // Also create a notification for the receiver
        await notificationRepository.createNotification({
            userId: receiverId,
            title: 'New Message',
            message: `${req.user.name} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            link: `/messages/${req.user.id}`
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
