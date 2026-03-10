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
