import { Router } from 'express';
import {
  applyForVerification,
  getCreatorProfile,
  verifyCreator,
  listCreators,
  updateCreatorProfile,
} from '../controllers/creatorController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', listCreators);
router.get('/:id', getCreatorProfile);

// Authenticated routes
router.post('/apply', authenticateToken, applyForVerification);
router.put('/:id', authenticateToken, updateCreatorProfile);

// Admin routes
router.put('/:id/verify', authenticateToken, requireRole(['admin']), verifyCreator);

export default router;
