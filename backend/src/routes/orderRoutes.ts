import { Router } from 'express';
import {
  createOrder,
  confirmPayment,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protected routes
router.post('/', authenticateToken, createOrder);
router.post('/confirm', authenticateToken, confirmPayment);
router.get('/me/orders', authenticateToken, getMyOrders);
router.get('/:id', authenticateToken, getOrder);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.post('/:id/cancel', authenticateToken, cancelOrder);

export default router;
