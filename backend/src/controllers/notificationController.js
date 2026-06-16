import notificationRepository from '../data/notificationRepository.js';

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await notificationRepository.getByUserId(req.user.id);
        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const updated = await notificationRepository.markAsRead(notificationId);
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const updated = await notificationRepository.markAllAsRead(req.user.id);
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};
