import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../data/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const DOMAIN = process.env.UNIVERSITY_DOMAIN || 'liu.edu';

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!email.endsWith(`@${DOMAIN}`)) {
      return res.status(400).json({ error: `Must use a valid @${DOMAIN} email address` });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'STUDENT',
    });

    res.status(201).json({ message: 'Student registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const registerAlumni = async (req, res) => {
  try {
    const { name, email, password, graduationYear } = req.body;

    if (!name || !email || !password || !graduationYear) {
      return res.status(400).json({ error: 'Name, email, password, and graduationYear are required' });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'ALUMNI',
      graduationYear,
    });

    res.status(201).json({ message: 'Alumni registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'ALUMNI' && user.isApproved === false) {
      return res.status(403).json({ error: 'Your alumni account is pending approval by an instructor.' });
    }

    const payload = { 
      id: user.id, 
      role: user.role, 
      email: user.email, 
      needsPasswordChange: user.needsPasswordChange 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = (req, res) => {
  // Stateless JWT: Just respond ok, frontend will drop the token
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await userRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await userRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only check old password if the user was required to change it, 
    // or if you want to always require old password for security.
    // For "temporary password", oldPassword is theoretically the one they logged in with.
    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
         return res.status(401).json({ error: 'Invalid old password' });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await userRepository.updatePassword(user.id, passwordHash);

    // Issue a fresh token since their security state changed
    const payload = { 
      id: updatedUser.id, 
      role: updatedUser.role, 
      email: updatedUser.email, 
      needsPasswordChange: false 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, message: 'Password updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};
