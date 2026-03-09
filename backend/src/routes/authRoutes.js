import express from 'express';
import {
  registerStudent,
  registerAlumni,
  login,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register/student', registerStudent);
router.post('/register/alumni', registerAlumni);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);

export default router;
