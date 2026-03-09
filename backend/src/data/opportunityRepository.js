import { supabase } from '../config/supabase.js';

class OpportunityRepository {
  async getAll() {
    const { data: opportunities, error } = await supabase.from('opportunities').select('*');
    if (error) throw error;
    return opportunities.map(o => this._mapToCamelCase(o));
  }

  async getById(id) {
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error || !opportunity) return null;
    return this._mapToCamelCase(opportunity);
  }

  async getByUserId(userId) {
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('created_by_user_id', userId);
      
    if (error) throw error;
    return opportunities.map(o => this._mapToCamelCase(o));
  }

  async create(opportunityData) {
    const mappedData = {
      title: opportunityData.title,
      company: opportunityData.company,
      type: opportunityData.type,
      location: opportunityData.location,
      mode: opportunityData.mode,
      description: opportunityData.description,
      requirements: opportunityData.requirements || [],
      deadline: opportunityData.deadline || null,
      created_by_user_id: opportunityData.createdByUserId,
      created_by_role: opportunityData.createdByRole,
    };

    const { data: newOpp, error } = await supabase
      .from('opportunities')
      .insert(mappedData)
      .select()
      .single();

    if (error) throw error;
    return this._mapToCamelCase(newOpp);
  }

  async update(id, updates) {
    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.mode !== undefined) payload.mode = updates.mode;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.requirements !== undefined) payload.requirements = updates.requirements;
    if (updates.deadline !== undefined) payload.deadline = updates.deadline;

    const { data: updatedOpp, error } = await supabase
      .from('opportunities')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapToCamelCase(updatedOpp);
  }

  async delete(id) {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  _mapToCamelCase(row) {
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

export default new OpportunityRepository();
