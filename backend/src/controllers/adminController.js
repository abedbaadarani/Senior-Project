import bcrypt from 'bcrypt';
import userRepository from '../data/userRepository.js';
import auditLogService from '../services/auditLogService.js';

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'This email has already been used.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      needsPasswordChange: true,
    });

    auditLogService.logAction(req.user, 'create-admin', 'USER', newAdmin.id, { email });

    res.status(201).json({ message: 'ADMIN created successfully', user: newAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ADMIN' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 8-char alphanumeric temporary password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPassword = '';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await userRepository.resetPassword(userId, passwordHash);

    auditLogService.logAction(req.user, 'reset-password', 'USER', userId, { email: user.email });

    res.json({ message: 'Password reset successfully', temporaryPassword: tempPassword, userName: user.name, userEmail: user.email });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const createInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'This email has already been used.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newInstructor = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'INSTRUCTOR',
      needsPasswordChange: true,
    });

    auditLogService.logAction(req.user, 'create-instructor', 'USER', newInstructor.id, { email });

    res.status(201).json({ message: 'INSTRUCTOR created successfully', user: newInstructor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create INSTRUCTOR' });
  }
};
