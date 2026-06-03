import { Router } from 'express';
import {
  signup,
  register,
  login,
  refreshToken,
  getProfile,
  getMe,
  updateProfile,
  changePassword,
  requestPhoneOTP,
  verifyPhoneOTP,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/otp/request', requestPhoneOTP);
router.post('/otp/verify', verifyPhoneOTP);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
