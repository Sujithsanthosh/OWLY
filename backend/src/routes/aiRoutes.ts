import { Router } from 'express';
import {
  chatWithAssistant,
  getAIRecommendations,
  getFoodRecommendations,
  getFashionRecommendations,
  getStylistAdvice,
  moderateContent,
} from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Chat with AI assistant
router.post('/chat', authenticateToken, chatWithAssistant);

// Get recommendations
router.get('/recommendations', authenticateToken, getAIRecommendations);
router.get('/recommend/food', authenticateToken, getFoodRecommendations);
router.get('/recommend/fashion', authenticateToken, getFashionRecommendations);

// Styling advice
router.post('/style/suggest', authenticateToken, getStylistAdvice);

// Content moderation
router.post('/moderate/content', moderateContent);

export default router;
