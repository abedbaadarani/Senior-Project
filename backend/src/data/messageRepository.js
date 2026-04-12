import { supabase } from '../config/supabase.js';

class MessageRepository {
    async getConversations(userId) {
        // A somewhat tricky query in Supabase directly, so we can fetch all messages involving the user
        // and extract the latest message per conversation
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*, sender:users!sender_id(id, name, email, role), receiver:users!receiver_id(id, name, email, role)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by conversation partner
        const conversations = new Map();
        messages.forEach(msg => {
            const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
            const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!conversations.has(partnerId)) {
                conversations.set(partnerId, {
                    partnerId,
                    partner,
                    latestMessage: this._mapToCamelCase(msg),
                    unreadCount: (msg.receiver_id === userId && !msg.is_read) ? 1 : 0
                });
            } else {
                if (msg.receiver_id === userId && !msg.is_read) {
                    conversations.get(partnerId).unreadCount++;
                }
            }
        });

        return Array.from(conversations.values());
    }

    async getMessagesBetween(userId1, userId2) {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*, sender:users!sender_id(id, name, email, role)')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('created_at', { ascending: true }); // old to new

        if (error) throw error;
        return messages.map(m => this._mapToCamelCase(m));
    }

    async sendMessage(senderId, receiverId, content) {
        const { data, error } = await supabase
            .from('messages')
            .insert({ sender_id: senderId, receiver_id: receiverId, content })
            .select('*, sender:users!sender_id(id, name, email, role), receiver:users!receiver_id(id, name, email, role)')
            .single();

        if (error) throw error;
        return this._mapToCamelCase(data);
    }

    async markAsRead(userId, partnerId) {
        const { data, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', partnerId)
            .select();

        if (error) throw error;
        return data;
    }

    _mapToCamelCase(row) {
        if (!row) return row;
        return {
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            isRead: row.is_read,
            createdAt: row.created_at,
            sender: row.sender ? {
                id: row.sender.id,
                name: row.sender.name,
                email: row.sender.email,
                role: row.sender.role
            } : null,
            receiver: row.receiver ? {
                id: row.receiver.id,
                name: row.receiver.name,
                email: row.receiver.email,
                role: row.receiver.role
            } : null
        };
    }
}

export default new MessageRepository();
