import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../data/userRepository.js';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const DOMAIN = process.env.UNIVERSITY_DOMAIN || 'liu.edu';

export const registerStudent = async (req, res) => {
  try {
    const { name, fatherName, email, password } = req.body;

    if (!name || !fatherName || !email || !password) {
      return res.status(400).json({ error: 'Name, Father Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const emailMatch = email.match(/^(\d+)@students\.liu\.edu\.lb$/);
    if (!emailMatch) {
      return res.status(400).json({ error: 'Must use a valid ID@students.liu.edu.lb email' });
    }
    const universityId = emailMatch[1];

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'This email has already been used.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({
      name,
      fatherName,
      email,
      passwordHash,
      role: 'STUDENT',
      universityId,
    });

    res.status(201).json({ message: 'Student registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

export const registerAlumni = async (req, res) => {
  try {
    const { name, fatherName, email, password, graduationYear, universityId } = req.body;

    if (!name || !fatherName || !email || !password || !graduationYear || !universityId) {
      return res.status(400).json({ error: 'Name, Father Name, University ID, email, password, and graduationYear are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'This email has already been used.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({
      name,
      fatherName,
      email,
      passwordHash,
      role: 'ALUMNI',
      graduationYear,
      universityId,
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
      name: user.name,
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

export const updateProfile = async (req, res) => {
  try {
    const { major, linkedinUrl, githubUrl } = req.body;
    let cvUrl = req.body.cvUrl || null; // fallback to existing cvUrl if passed as text

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('resumes')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) {
        throw new Error('File upload to storage failed');
      }

      const { data: publicData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      if (publicData) {
        cvUrl = publicData.publicUrl;
      }
    }

    // Always call the repository, even if cvUrl wasn't changed
    const updatedUser = await userRepository.updateProfile(req.user.id, {
      major,
      cvUrl,
      linkedinUrl,
      githubUrl
    });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await userRepository.getUserByIdWithPassword(req.user.id);
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
      name: updatedUser.name,
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
