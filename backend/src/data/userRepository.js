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

  async createUser(userData) {
    const mappedData = {
      name: userData.name,
      email: userData.email,
      password_hash: userData.passwordHash,
      role: userData.role,
      graduation_year: userData.graduationYear || null,
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

  _mapToCamelCase(row) {
    if (!row) return row;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      graduationYear: row.graduation_year,
      isApproved: row.is_approved,
      needsPasswordChange: row.needs_password_change || false,
      createdAt: row.created_at,
    };
  }
}

export default new UserRepository();
