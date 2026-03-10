import express from 'express';
import multer from 'multer';
import {
  registerStudent,
  registerAlumni,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register/student', registerStudent);
router.post('/register/alumni', registerAlumni);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, upload.single('cvFile'), updateProfile);
router.post('/change-password', requireAuth, changePassword);

export default router;
