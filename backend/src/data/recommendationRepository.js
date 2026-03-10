import { supabase } from '../config/supabase.js';

class RecommendationRepository {
  async getAll() {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        student:users!recommendations_student_id_fkey(name, email, graduation_year),
        instructor:users!recommendations_instructor_id_fkey(name, email),
        opportunity:opportunities!recommendations_opportunity_id_fkey(title, company)
      `);
    if (error) throw error;
    return recommendations.map(r => this._mapToCamelCase(r));
  }

  async getByInstructorId(instructorId) {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        student:users!recommendations_student_id_fkey(name, email, graduation_year),
        opportunity:opportunities!recommendations_opportunity_id_fkey(title, company)
      `)
      .eq('instructor_id', instructorId);

    if (error) throw error;
    return recommendations.map(r => this._mapToCamelCase(r));
  }

  async getByStudentId(studentId) {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        instructor:users!recommendations_instructor_id_fkey(name, email),
        opportunity:opportunities!recommendations_opportunity_id_fkey(title, company)
      `)
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
      student: row.student,
      instructor: row.instructor,
      opportunity: row.opportunity,
    };
  }
}

export default new RecommendationRepository();
