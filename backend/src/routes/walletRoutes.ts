import { Router } from 'express';
import {
  getWallet,
  addMoneyToWallet,
  useWalletBalance,
  getWalletTransactions,
  refundToWallet,
  withdrawFromWallet,
} from '../controllers/walletController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protected routes
router.get('/', authenticateToken, getWallet);
router.get('/transactions', authenticateToken, getWalletTransactions);
router.post('/add-money', authenticateToken, addMoneyToWallet);
router.post('/use-balance', authenticateToken, useWalletBalance);
router.post('/refund', authenticateToken, refundToWallet);
router.post('/withdraw', authenticateToken, withdrawFromWallet);

export default router;
