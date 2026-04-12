import { supabase } from '../config/supabase.js';

class ApplicationRepository {
    async getByUserId(userId) {
        const { data: applications, error } = await supabase
            .from('applications')
            .select('*, opportunities(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return applications.map(a => this._mapToCamelCase(a));
    }

    async getByOpportunityId(opportunityId) {
        const { data: applications, error } = await supabase
            .from('applications')
            .select('*, users(id, name, email, major, cv_url, linkedin_url, github_url)')
            .eq('opportunity_id', opportunityId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return applications.map(a => this._mapToCamelCase(a));
    }

    async checkApplication(userId, opportunityId) {
        const { data, error } = await supabase
            .from('applications')
            .select('id, status')
            .eq('user_id', userId)
            .eq('opportunity_id', opportunityId)
            .maybeSingle();

        if (error) throw error;
        return data ? this._mapToCamelCase(data) : null;
    }

    async apply(userId, opportunityId) {
        const { data, error } = await supabase
            .from('applications')
            .insert({ user_id: userId, opportunity_id: opportunityId, status: 'PENDING' })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') throw new Error('Already applied');
            throw error;
        }
        return this._mapToCamelCase(data);
    }

    async updateStatus(applicationId, status) {
        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) throw error;
        return this._mapToCamelCase(data);
    }

    async getApplicationById(id) {
        const { data, error } = await supabase
            .from('applications')
            .select('*, opportunities(id, title, company, type, mode, location, description, requirements, deadline, created_by_user_id, created_at)')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return this._mapToCamelCase(data);
    }

    _mapToCamelCase(row) {
        if (!row) return row;
        return {
            id: row.id,
            userId: row.user_id,
            opportunityId: row.opportunity_id,
            status: row.status,
            createdAt: row.created_at,
            opportunity: row.opportunities ? {
                id: row.opportunities.id,
                title: row.opportunities.title,
                company: row.opportunities.company,
                type: row.opportunities.type,
                location: row.opportunities.location,
                mode: row.opportunities.mode,
                description: row.opportunities.description,
                requirements: row.opportunities.requirements,
                deadline: row.opportunities.deadline,
                createdByUserId: row.opportunities.created_by_user_id,
                createdAt: row.opportunities.created_at
            } : null,
            user: row.users ? {
                id: row.users.id,
                name: row.users.name,
                email: row.users.email,
                major: row.users.major,
                cvUrl: row.users.cv_url,
                linkedinUrl: row.users.linkedin_url,
                githubUrl: row.users.github_url
            } : null
        };
    }
}

export default new ApplicationRepository();
