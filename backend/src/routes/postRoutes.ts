import { Router } from 'express';
import {
  createPost,
  getFeed,
  getCommunityFeed,
  getPost,
  likePost,
  unlikePost,
  deletePost,
  trackView,
} from '../controllers/postController';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Posts
router.post('/', authenticateToken, createPost);
router.get('/feed', (req, res, next) => {
  // Optional auth for feed
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, getFeed);

router.get('/:id', getPost);
router.get('/community/:id/feed', getCommunityFeed);
router.delete('/:id', authenticateToken, deletePost);

// Likes
router.post('/:id/like', authenticateToken, likePost);
router.post('/:id/unlike', authenticateToken, unlikePost);

// Views
router.post('/:id/view', trackView);

// Comments
router.post('/:post_id/comments', authenticateToken, createComment);
router.get('/:post_id/comments', getPostComments);
router.put('/comments/:id', authenticateToken, updateComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

// Reviews
router.post('/reviews', authenticateToken, createReview);
router.get('/reviews/product/:product_id', getProductReviews);
router.put('/reviews/:id', authenticateToken, updateReview);
router.delete('/reviews/:id', authenticateToken, deleteReview);
router.get('/reviews/user/my-reviews', authenticateToken, getUserReviews);

export default router;
