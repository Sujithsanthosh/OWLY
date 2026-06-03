import { Router } from 'express';
import {
  updateDeliveryLocation,
  getOrderDeliveryStatus,
  getAvailableOrders,
  acceptDeliveryOrder,
  updateOrderDeliveryStatus,
  getMyDeliveries,
  getDeliveryEarnings,
  getDeliveryStats,
  updateAvailability,
} from '../controllers/deliveryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get available orders
router.get('/available-orders', authenticateToken, getAvailableOrders);

// Accept order for delivery
router.post('/accept-order/:orderId', authenticateToken, acceptDeliveryOrder);

// Update delivery location
router.post('/location', authenticateToken, updateDeliveryLocation);

// Get order delivery status
router.get('/status/:orderId', authenticateToken, getOrderDeliveryStatus);

// Get my active deliveries
router.get('/my-deliveries', authenticateToken, getMyDeliveries);

// Update order delivery status
router.put('/order/:orderId/status', authenticateToken, updateOrderDeliveryStatus);

// Get earnings
router.get('/earnings', authenticateToken, getDeliveryEarnings);

// Get statistics
router.get('/stats', authenticateToken, getDeliveryStats);

// Update availability
router.put('/availability', authenticateToken, updateAvailability);

export default router;
