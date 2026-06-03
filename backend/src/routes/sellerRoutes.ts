import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import {
  getSellerStats,
  getSellerProducts,
  getSellerOrders,
  getSellerReviews,
  getSellerAnalytics,
  createCampaign,
  updateOrderStatus,
  getInventory,
  updateInventory,
} from '../controllers/sellerController';

const router = Router();

// All seller routes require authentication and seller role
router.use(authenticateToken, requireRole(['seller']));

// Dashboard
router.get('/dashboard/stats', getSellerStats);
router.get('/analytics', getSellerAnalytics);

// Products
router.get('/products', getSellerProducts);
router.get('/inventory', getInventory);
router.put('/inventory/:productId', updateInventory);

// Orders
router.get('/orders', getSellerOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Reviews
router.get('/reviews', getSellerReviews);

// Campaigns
router.post('/campaigns', createCampaign);

export default router;
