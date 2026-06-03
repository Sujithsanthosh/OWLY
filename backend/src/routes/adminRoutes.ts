import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import {
  getDashboardStats,
  getUsers,
  suspendUser,
  activateUser,
  getSellers,
  approveSeller,
  banSeller,
  getOrders,
  resolveDispute,
  getReports,
  actionOnReport,
  getAnalytics,
  getPayments,
  processPayout,
  updateSettings,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRole(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:userId/suspend', suspendUser);
router.put('/users/:userId/activate', activateUser);

// Sellers
router.get('/sellers', getSellers);
router.put('/sellers/:sellerId/approve', approveSeller);
router.post('/sellers/:sellerId/ban', banSeller);

// Orders
router.get('/orders', getOrders);
router.post('/orders/:orderId/resolve-dispute', resolveDispute);

// Reports
router.get('/reports', getReports);
router.post('/reports/:reportId/action', actionOnReport);

// Payments
router.get('/payments', getPayments);
router.post('/payouts', processPayout);

// Settings
router.post('/settings', updateSettings);

export default router;
