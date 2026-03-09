import { supabase } from '../config/supabase.js';

class RecommendationRepository {
  async getAll() {
    const { data: recommendations, error } = await supabase.from('recommendations').select('*');
    if (error) throw error;
    return recommendations.map(r => this._mapToCamelCase(r));
  }

  async getByInstructorId(instructorId) {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('instructor_id', instructorId);
      
    if (error) throw error;
    return recommendations.map(r => this._mapToCamelCase(r));
  }

  async getByStudentId(studentId) {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return recommendations.map(r => this._mapToCamelCase(r));
  }

  async create(recData) {
    const mappedData = {
      instructor_id: recData.instructorId,
      student_id: recData.studentId,
      opportunity_id: recData.opportunityId,
      message: recData.message,
    };

    const { data: newRec, error } = await supabase
      .from('recommendations')
      .insert(mappedData)
      .select()
      .single();

    if (error) throw error;
    return this._mapToCamelCase(newRec);
  }

  _mapToCamelCase(row) {
    if (!row) return row;
    return {
      id: row.id,
      instructorId: row.instructor_id,
      studentId: row.student_id,
      opportunityId: row.opportunity_id,
      message: row.message,
      createdAt: row.created_at,
    };
  }
}

export default new RecommendationRepository();
