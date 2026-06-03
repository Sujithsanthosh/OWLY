import { Router } from 'express';
import {
  createLivestream,
  listLivestreams,
  getLivestream,
  startLivestream,
  endLivestream,
  pinProduct,
  unpinProduct,
  getLivestreamComments,
  postLivestreamComment,
  sendTip,
  updateViewerCount,
} from '../controllers/livestreamController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Create livestream (authenticated)
router.post('/', authenticateToken, createLivestream);

// List livestreams (public)
router.get('/', listLivestreams);

// Get livestream details (public)
router.get('/:id', getLivestream);

// Start livestream (authenticated, host only)
router.post('/:id/start', authenticateToken, startLivestream);

// End livestream (authenticated, host only)
router.post('/:id/end', authenticateToken, endLivestream);

// Pin product during livestream (authenticated, host only)
router.put('/:id/pin-product', authenticateToken, pinProduct);

// Unpin product (authenticated, host only)
router.delete('/:id/pin-product/:product_id', authenticateToken, unpinProduct);

// Get livestream comments (public)
router.get('/:id/comments', getLivestreamComments);

// Post livestream comment (authenticated)
router.post('/:id/comments', authenticateToken, postLivestreamComment);

// Send tip to host (authenticated)
router.post('/:id/tip', authenticateToken, sendTip);

// Update viewer count (authenticated, could be host or system)
router.put('/:id/viewer-count', authenticateToken, updateViewerCount);

export default router;
