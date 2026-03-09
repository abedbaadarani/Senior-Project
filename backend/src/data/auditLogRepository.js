import { supabase } from '../config/supabase.js';

class AuditLogRepository {
  async create(logData) {
    const mappedData = {
      actor_user_id: logData.actorUserId,
      actor_role: logData.actorRole,
      action: logData.action,
      target_type: logData.targetType,
      target_id: logData.targetId,
      metadata: logData.metadata || {},
    };

    const { data: newLog, error } = await supabase
      .from('audit_logs')
      .insert(mappedData)
      .select()
      .single();

    if (error) {
      console.error('AuditLog insert failed:', error);
      throw error;
    }
    return this._mapToCamelCase(newLog);
  }

  async getPaginated(page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1; // Supabase range is inclusive
    
    // Total count query
    const { count, error: countError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;

    // Data query
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(startIndex, endIndex);
      
    if (error) throw error;

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: logs.map(l => this._mapToCamelCase(l)),
    };
  }

  _mapToCamelCase(row) {
    if (!row) return row;
    return {
      id: row.id,
      actorUserId: row.actor_user_id,
      actorRole: row.actor_role,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      timestamp: row.timestamp,
      metadata: row.metadata,
    };
  }
}

export default new AuditLogRepository();
