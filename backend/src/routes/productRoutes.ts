import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  createFoodItem,
  getFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getSellerFoodItems,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Fashion Products
router.get('/fashion', getProducts);
router.get('/fashion/:id', getProduct);
router.post('/fashion', authenticateToken, createProduct);
router.put('/fashion/:id', authenticateToken, updateProduct);
router.delete('/fashion/:id', authenticateToken, deleteProduct);
router.get('/fashion/seller/my-products', authenticateToken, getSellerProducts);

// Food Items
router.get('/food', getFoodItems);
router.post('/food', authenticateToken, createFoodItem);
router.put('/food/:id', authenticateToken, updateFoodItem);
router.delete('/food/:id', authenticateToken, deleteFoodItem);
router.get('/food/seller/my-items', authenticateToken, getSellerFoodItems);

export default router;
