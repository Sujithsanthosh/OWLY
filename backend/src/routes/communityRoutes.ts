import { Router } from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getUserCommunities,
} from '../controllers/communityController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getCommunities);
router.get('/:id', getCommunity);

// Protected routes
router.post('/', authenticateToken, createCommunity);
router.put('/:id', authenticateToken, updateCommunity);
router.post('/:id/join', authenticateToken, joinCommunity);
router.post('/:id/leave', authenticateToken, leaveCommunity);
router.get('/:id/members', getCommunityMembers);
router.get('/user/my-communities', authenticateToken, getUserCommunities);

export default router;
