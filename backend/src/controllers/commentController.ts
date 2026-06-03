import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Create comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { post_id, content } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!post_id || !content) {
      return sendError(res, null, 'Post ID and content are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, post_id, user_id, content, created_at`,
      [post_id, user_id, content]
    );

    // Update post comment count
    await pool.query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1',
      [post_id]
    );

    // Log interaction
    await pool.query(
      `INSERT INTO user_interactions (user_id, post_id, interaction_type, weight, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user_id, post_id, 'comment', 3]
    );

    return sendSuccess(res, result.rows[0], 'Comment created successfully', 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return sendError(res, error, 'Failed to create comment', 500);
  }
};

// Get post comments
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [post_id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1',
      [post_id]
    );

    return sendSuccess(res, {
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return sendError(res, error, 'Failed to get comments', 500);
  }
};

// Update comment
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
    if (comment.rows.length === 0 || comment.rows[0].user_id !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE comments SET content = $1 WHERE id = $2
       RETURNING id, post_id, user_id, content, created_at`,
      [content, id]
    );

    return sendSuccess(res, result.rows[0], 'Comment updated successfully');
  } catch (error) {
    console.error('Update comment error:', error);
    return sendError(res, error, 'Failed to update comment', 500);
  }
};

// Delete comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const comment = await pool.query(
      'SELECT user_id, post_id FROM comments WHERE id = $1',
      [id]
    );

    if (comment.rows.length === 0 || comment.rows[0].user_id !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const post_id = comment.rows[0].post_id;

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    // Update post comment count
    await pool.query(
      'UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1',
      [post_id]
    );

    return sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    return sendError(res, error, 'Failed to delete comment', 500);
  }
};
