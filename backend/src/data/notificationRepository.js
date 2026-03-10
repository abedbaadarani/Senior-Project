import { supabase } from '../config/supabase.js';

class NotificationRepository {
    async getByUserId(userId) {
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return notifications.map(n => this._mapToCamelCase(n));
    }

    async createNotification({ userId, title, message, link }) {
        const { data, error } = await supabase
            .from('notifications')
            .insert({ user_id: userId, title, message, link })
            .select()
            .single();

        if (error) throw error;
        return this._mapToCamelCase(data);
    }

    async markAsRead(notificationId) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) throw error;
        return this._mapToCamelCase(data);
    }

    async markAllAsRead(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        return data.map(n => this._mapToCamelCase(n));
    }

    _mapToCamelCase(row) {
        if (!row) return row;
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            message: row.message,
            link: row.link,
            isRead: row.is_read,
            createdAt: row.created_at
        };
    }
}

export default new NotificationRepository();
