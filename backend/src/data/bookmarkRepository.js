import { supabase } from '../config/supabase.js';

class BookmarkRepository {
    async getBookmarksByUser(userId) {
        const { data: bookmarks, error } = await supabase
            .from('bookmarks')
            .select('*, opportunities(*)')
            .eq('user_id', userId);

        if (error) throw error;

        // map the opportunities inside
        return bookmarks.map(b => this._mapOppToCamelCase(b.opportunities));
    }

    async checkBookmark(userId, opportunityId) {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('opportunity_id', opportunityId)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    }

    async addBookmark(userId, opportunityId) {
        const { error } = await supabase
            .from('bookmarks')
            .insert({ user_id: userId, opportunity_id: opportunityId });

        if (error) {
            if (error.code === '23505') return true; // unique constraint violation, already bookmarked
            throw error;
        }
        return true;
    }

    async removeBookmark(userId, opportunityId) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq('opportunity_id', opportunityId);

        if (error) throw error;
        return true;
    }

    _mapOppToCamelCase(row) {
        if (!row) return row;
        return {
            id: row.id,
            title: row.title,
            company: row.company,
            type: row.type,
            location: row.location,
            mode: row.mode,
            description: row.description,
            requirements: row.requirements,
            deadline: row.deadline,
            createdByUserId: row.created_by_user_id,
            createdByRole: row.created_by_role,
            createdAt: row.created_at,
        };
    }
}

export default new BookmarkRepository();
