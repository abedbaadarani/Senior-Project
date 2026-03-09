import express from 'express';
import userRepository from '../data/userRepository.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const users = userRepository.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const user = userRepository.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
