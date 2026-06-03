import { Router } from 'express';
import {
  awardBadge,
  getUserBadges,
  checkStreak,
  getUserLevel,
  updateUserLevel,
  getLeaderboards,
  getAvailableBadges,
} from '../controllers/gamificationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Badge routes
router.post('/badges/award', authenticateToken, awardBadge);
router.get('/badges/available', getAvailableBadges);
router.get('/badges/:user_id', getUserBadges);

// Streak routes
router.post('/streaks/check', authenticateToken, checkStreak);

// Level routes
router.get('/levels/:user_id', getUserLevel);
router.post('/levels/update', authenticateToken, updateUserLevel);

// Leaderboard routes
router.get('/leaderboards', getLeaderboards);

export default router;
