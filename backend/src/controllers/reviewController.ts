import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Create review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, product_type, rating, comment, image_urls } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!product_id || !product_type || !rating) {
      return sendError(res, null, 'Product ID, type, and rating are required', 400);
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, null, 'Rating must be between 1 and 5', 400);
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, product_id, product_type, rating, comment, image_urls, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, user_id, product_id, product_type, rating, comment, image_urls, created_at`,
      [user_id, product_id, product_type, rating, comment, image_urls || []]
    );

    return sendSuccess(res, result.rows[0], 'Review created successfully', 201);
  } catch (error) {
    console.error('Create review error:', error);
    return sendError(res, error, 'Failed to create review', 500);
  }
};

// Get product reviews
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { product_id, product_type = 'product' } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.product_type = $2
       ORDER BY r.created_at DESC
       LIMIT $3 OFFSET $4`,
      [product_id, product_type, limit, offset]
    );

    // Calculate average rating
    const ratingResult = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE product_id = $1 AND product_type = $2`,
      [product_id, product_type]
    );

    const stats = ratingResult.rows[0];

    return sendSuccess(res, {
      reviews: result.rows,
      stats: {
        average_rating: parseFloat(stats.avg_rating) || 0,
        total_reviews: parseInt(stats.total_reviews) || 0,
      },
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return sendError(res, error, 'Failed to get reviews', 500);
  }
};

// Update review
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, image_urls } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const review = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [id]);
    if (review.rows.length === 0 || review.rows[0].user_id !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    if (rating && (rating < 1 || rating > 5)) {
      return sendError(res, null, 'Rating must be between 1 and 5', 400);
    }

    const result = await pool.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment),
           image_urls = COALESCE($3, image_urls)
       WHERE id = $4
       RETURNING id, product_id, product_type, rating, comment, image_urls`,
      [rating, comment, image_urls, id]
    );

    return sendSuccess(res, result.rows[0], 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    return sendError(res, error, 'Failed to update review', 500);
  }
};

// Delete review
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const review = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [id]);
    if (review.rows.length === 0 || review.rows[0].user_id !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return sendError(res, error, 'Failed to delete review', 500);
  }
};

// Get user reviews
export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT * FROM reviews WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    return sendSuccess(res, {
      reviews: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return sendError(res, error, 'Failed to get user reviews', 500);
  }
};
