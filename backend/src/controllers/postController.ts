import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';
import { analyzeMediaForProducts, getPersonalizedFeedAlgorithm } from '../services/aiService';

export interface AuthRequest extends Request {
  user?: any;
}

// Create post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { community_id, content, media_urls, type, product_id } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!content && (!media_urls || media_urls.length === 0)) {
      return sendError(res, null, 'Content or media is required', 400);
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, community_id, content, media_urls, type, product_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, user_id, community_id, content, media_urls, type, likes_count, comments_count, created_at`,
      [user_id, community_id, content, media_urls || [], type || 'standard', product_id]
    );

    const post = result.rows[0];

    // AI Refinement: If media exists, analyze it for product suggestions
    if (media_urls && media_urls.length > 0) {
      try {
        const suggestions = await analyzeMediaForProducts(media_urls[0]);
        if (suggestions) {
          await pool.query('UPDATE posts SET metadata = $1 WHERE id = $2', [JSON.stringify(suggestions), post.id]);
          post.ai_suggestions = suggestions;
        }
      } catch (aiError) {
        console.log('AI analysis skipped:', aiError);
      }
    }

    return sendSuccess(res, post, 'Post created successfully', 201);
  } catch (error) {
    console.error('Create post error:', error);
    return sendError(res, error, 'Failed to create post', 500);
  }
};

// Get feed
export const getFeed = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));
    const user_id = req.user?.userId;

    let personalizedFeed = null;

    // Try personalized feed if user is authenticated
    if (user_id) {
      try {
        personalizedFeed = await getPersonalizedFeedAlgorithm(user_id);
      } catch (error) {
        console.log('Personalized feed unavailable, using default');
      }
    }

    // Fallback to default feed
    if (!personalizedFeed) {
      const result = await pool.query(
        `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return sendSuccess(res, {
        posts: result.rows,
        page: Number(page),
        limit: Number(limit),
      });
    }

    return sendSuccess(res, {
      posts: personalizedFeed,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return sendError(res, error, 'Failed to get feed', 500);
  }
};

// Get community feed
export const getCommunityFeed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.community_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return sendSuccess(res, {
      posts: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get community feed error:', error);
    return sendError(res, error, 'Failed to get community feed', 500);
  }
};

// Get single post
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Post not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Get post error:', error);
    return sendError(res, error, 'Failed to get post', 500);
  }
};

// Like post
export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already liked
      const likeCheck = await client.query(
        'SELECT id FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
        [user_id, id, 'like']
      );

      if (likeCheck.rows.length === 0) {
        await client.query(
          'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
          [id]
        );

        await client.query(
          'INSERT INTO user_interactions (user_id, post_id, interaction_type, weight, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [user_id, id, 'like', 5]
        );
      }

      await client.query('COMMIT');
      return sendSuccess(res, null, 'Post liked successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Like post error:', error);
    return sendError(res, error, 'Failed to like post', 500);
  }
};

// Unlike post
export const unlikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const likeCheck = await client.query(
        'SELECT id FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
        [user_id, id, 'like']
      );

      if (likeCheck.rows.length > 0) {
        await client.query(
          'UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
          [id]
        );

        await client.query(
          'DELETE FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
          [user_id, id, 'like']
        );
      }

      await client.query('COMMIT');
      return sendSuccess(res, null, 'Post unliked successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Unlike post error:', error);
    return sendError(res, error, 'Failed to unlike post', 500);
  }
};

// Delete post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0 || post.rows[0].user_id !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Post deleted successfully');
  } catch (error) {
    console.error('Delete post error:', error);
    return sendError(res, error, 'Failed to delete post', 500);
  }
};

// Track view
export const trackView = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendSuccess(res, null, 'View tracked');
    }

    await pool.query(
      `INSERT INTO user_interactions (user_id, post_id, interaction_type, weight, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user_id, id, 'view', 1]
    );

    return sendSuccess(res, null, 'View tracked');
  } catch (error) {
    console.error('Track view error:', error);
    return sendError(res, error, 'Failed to track view', 500);
  }
};
