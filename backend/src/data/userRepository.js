import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

class UserRepository {
  async getAllUsers() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return users.map(user => this._mapToCamelCase(user)).map(({ passwordHash, ...user }) => user);
  }

  async getUserById(id) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) return null;
    const { passwordHash, ...safeUser } = this._mapToCamelCase(user);
    return safeUser;
  }

  async getUserByIdWithPassword(id) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) return null;
    return this._mapToCamelCase(user);
  }

  async findByEmail(email) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) return null;
    return this._mapToCamelCase(user);
  }

  async getPendingAlumni() {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ALUMNI')
      .eq('is_approved', false);

    if (error) throw error;
    return users.map(user => this._mapToCamelCase(user)).map(({ passwordHash, ...user }) => user);
  }

  async getVerifiedAlumni() {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ALUMNI')
      .eq('is_approved', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return users.map(user => this._mapToCamelCase(user)).map(({ passwordHash, ...user }) => user);
  }

  async getValidCandidates() {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['STUDENT', 'ALUMNI'])
      .eq('is_approved', true);

    if (error) throw error;
    return users.map(user => this._mapToCamelCase(user)).map(({ passwordHash, ...user }) => user);
  }

  async approveUser(id) {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const { passwordHash, ...safeUser } = this._mapToCamelCase(updatedUser);
    return safeUser;
  }

  async updatePassword(id, newPasswordHash) {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, needs_password_change: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const { passwordHash, ...safeUser } = this._mapToCamelCase(updatedUser);
    return safeUser;
  }

  async resetPassword(id, newPasswordHash) {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, needs_password_change: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const { passwordHash, ...safeUser } = this._mapToCamelCase(updatedUser);
    return safeUser;
  }

  async updateProfile(id, profileData) {
    const dataToUpdate = {};
    if (profileData.major !== undefined) dataToUpdate.major = profileData.major;
    if (profileData.cvUrl !== undefined) dataToUpdate.cv_url = profileData.cvUrl;
    if (profileData.linkedinUrl !== undefined) dataToUpdate.linkedin_url = profileData.linkedinUrl;
    if (profileData.githubUrl !== undefined) dataToUpdate.github_url = profileData.githubUrl;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const { passwordHash, ...safeUser } = this._mapToCamelCase(updatedUser);
    return safeUser;
  }

  async createUser(userData) {
    const mappedData = {
      name: userData.name,
      father_name: userData.fatherName || null,
      email: userData.email,
      password_hash: userData.passwordHash,
      role: userData.role,
      major: userData.major || null,
      graduation_year: userData.graduationYear || null,
      university_id: userData.universityId || null,
      is_approved: userData.role === 'ALUMNI' ? false : true,
      needs_password_change: userData.needsPasswordChange || false,
    };

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(mappedData)
      .select()
      .single();

    if (error) throw error;

    const { passwordHash, ...safeUser } = this._mapToCamelCase(newUser);
    return safeUser;
  }

  async deleteUser(id) {
    const { data: deletedUser, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapToCamelCase(deletedUser);
  }

  _mapToCamelCase(row) {
    if (!row) return row;
    return {
      id: row.id,
      name: row.name,
      fatherName: row.father_name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      major: row.major,
      cvUrl: row.cv_url,
      linkedinUrl: row.linkedin_url,
      githubUrl: row.github_url,
      graduationYear: row.graduation_year,
      universityId: row.university_id,
      isApproved: row.is_approved,
      needsPasswordChange: row.needs_password_change || false,
      createdAt: row.created_at,
    };
  }
}

export default new UserRepository();
