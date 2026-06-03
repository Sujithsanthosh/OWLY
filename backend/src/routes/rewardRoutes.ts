import { Router } from 'express';
import {
  getMyRewards,
  getReferralCode,
  addPoints,
  redeemPoints,
  handleReferral,
  getLeaderboard,
} from '../controllers/rewardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get('/me', authenticateToken, getMyRewards);
router.get('/referral/code', authenticateToken, getReferralCode);
router.post('/points/add', authenticateToken, addPoints);
router.post('/points/redeem', authenticateToken, redeemPoints);
router.post('/referral/apply', authenticateToken, handleReferral);

export default router;
