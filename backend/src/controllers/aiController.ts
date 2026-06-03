import { Request, Response } from 'express';
import { getShoppingAssistantResponse } from '../services/aiService';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Chat with AI assistant
export const chatWithAssistant = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!query) {
      return sendError(res, null, 'Query is required', 400);
    }

    const userResult = await pool.query('SELECT interests, name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const userContext = {
      userId,
      userName: userResult.rows[0].name,
      interests: userResult.rows[0]?.interests || [],
    };

    const response = await getShoppingAssistantResponse(query, userContext);
    
    return sendSuccess(res, { response, timestamp: new Date() }, 'Assistant response generated');
  } catch (error: any) {
    console.error('Chat with assistant error:', error);
    return sendError(res, error, 'Failed to get assistant response', 500);
  }
};

// Get food recommendations
export const getFoodRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { dietary_restrictions, budget, limit = 5 } = req.query;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const userResult = await pool.query('SELECT interests FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const interests = userResult.rows[0]?.interests || [];
    let query = 'SELECT id, name, description, price, image_url, seller_id, cuisine_type, rating FROM food_items WHERE 1=1';
    const params: any[] = [];

    if (interests.length > 0) {
      params.push(interests);
      query += ` AND cuisine_type = ANY($${params.length})`;
    }

    if (dietary_restrictions) {
      params.push(dietary_restrictions);
      query += ` AND metadata->>'dietary_info' ILIKE $${params.length}`;
    }

    if (budget) {
      params.push(Number(budget));
      query += ` AND price <= $${params.length}`;
    }

    params.push(Number(limit));
    query += ` ORDER BY rating DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    
    return sendSuccess(res, {
      recommendations: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Food recommendations error:', error);
    return sendError(res, error, 'Failed to get recommendations', 500);
  }
};

// Get fashion/style recommendations
export const getFashionRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { style_preference, color, budget, limit = 5 } = req.query;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const userResult = await pool.query('SELECT interests FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const interests = userResult.rows[0]?.interests || [];
    let query = 'SELECT id, name, description, price, images, category, seller_id, rating FROM products WHERE type = \'fashion\' AND 1=1';
    const params: any[] = [];

    if (interests.length > 0) {
      params.push(interests);
      query += ` AND category = ANY($${params.length})`;
    }

    if (style_preference) {
      params.push(style_preference);
      query += ` AND metadata->>'style' ILIKE $${params.length}`;
    }

    if (color) {
      params.push(color);
      query += ` AND metadata->>'colors' ILIKE $${params.length}`;
    }

    if (budget) {
      params.push(Number(budget));
      query += ` AND price <= $${params.length}`;
    }

    params.push(Number(limit));
    query += ` ORDER BY rating DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    
    return sendSuccess(res, {
      recommendations: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Fashion recommendations error:', error);
    return sendError(res, error, 'Failed to get recommendations', 500);
  }
};

// AI stylist - outfit suggestions
export const getStylistAdvice = async (req: AuthRequest, res: Response) => {
  try {
    const { occasion, body_type, color_preference } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!occasion) {
      return sendError(res, null, 'Occasion is required', 400);
    }

    // In a real app, call OpenAI for styling advice
    const stylingAdvice = {
      occasion,
      bodyType: body_type || 'standard',
      colorPreference: color_preference || 'versatile',
      suggestions: [
        {
          outfit: 'Casual Weekend Look',
          items: ['fitted-tee', 'denim-pants', 'white-sneakers'],
          description: `Perfect for a relaxed ${occasion}`,
        },
      ],
      timestamp: new Date(),
    };

    return sendSuccess(res, stylingAdvice, 'Styling advice generated');
  } catch (error: any) {
    console.error('Stylist advice error:', error);
    return sendError(res, error, 'Failed to get styling advice', 500);
  }
};

// AI content moderation
export const moderateContent = async (req: Request, res: Response) => {
  try {
    const { content, type = 'text' } = req.body;

    if (!content) {
      return sendError(res, null, 'Content is required', 400);
    }

    // In a real app, call OpenAI Moderation API
    const moderationResult = {
      content,
      status: 'approved', // or 'review' or 'rejected'
      confidence: 0.98,
      flags: [],
      timestamp: new Date(),
    };

    return sendSuccess(res, moderationResult);
  } catch (error: any) {
    console.error('Content moderation error:', error);
    return sendError(res, error, 'Failed to moderate content', 500);
  }
};

// Get AI recommendations (combined)
export const getAIRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const userResult = await pool.query('SELECT interests, orders FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const interests = userResult.rows[0]?.interests || [];

    const products = await pool.query(
      'SELECT id, name, price, images, category FROM products WHERE category = ANY($1) LIMIT 5',
      [interests]
    );

    const food = await pool.query(
      'SELECT id, name, price, image_url, cuisine_type FROM food_items WHERE cuisine_type = ANY($1) LIMIT 5',
      [interests]
    );

    return sendSuccess(res, {
      recommended_fashion: products.rows,
      recommended_food: food.rows,
      personalized: true,
    });
  } catch (error: any) {
    console.error('AI recommendations error:', error);
    return sendError(res, error, 'Failed to get recommendations', 500);
  }
};
